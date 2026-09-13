import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

interface WithdrawRequest {
  providerId: string;
  amount: number;
  methodType: 'VODAFONE_CASH' | 'INSTAPAY' | 'BANK_TRANSFER';
  accountDetails: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as WithdrawRequest;
    const { providerId, amount, methodType, accountDetails } = body;

    // 1. Basic validation
    if (!providerId || !amount || amount <= 0 || !methodType || !accountDetails) {
      return NextResponse.json({ error: 'Missing or invalid fields in request' }, { status: 400 });
    }

    // 2. Wrap everything in a Prisma Interactive Transaction to prevent race conditions
    // This strictly ensures atomic updates so two concurrent withdrawal requests 
    // don't both succeed on the same balance (double-spending protection).
    const result = await prisma.$transaction(async (tx) => {
      // Find the wallet and ensure user exists
      const wallet = await tx.wallet.findUnique({
        where: { userId: providerId },
      });

      if (!wallet) {
        throw new Error('Wallet not found for this provider');
      }

      // Check available balance strictly
      if (wallet.availableBalance < amount) {
        throw new Error('Insufficient available balance');
      }

      // Deduct from availableBalance, move to pendingBalance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          availableBalance: { decrement: amount },
          pendingBalance: { increment: amount },
        },
      });

      // Create a PENDING transaction
      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'WITHDRAWAL',
          amount: amount,
          status: 'PENDING',
          payoutMethod: methodType,
          // Generate a local reference ID for tracking before sending to Gateway
          referenceId: `WD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    // 3. Initiate External Gateway Request (Paymob Disbursement)
    // ----------------------------------------------------------------------
    let externalGatewaySuccess = false;
    let externalReferenceId = null;

    try {
      const apiKey = process.env.PAYMOB_API_KEY;
      if (!apiKey) {
        throw new Error("PAYMOB_API_KEY is not configured on the server.");
      }

      // Step 3a: Authenticate with Paymob to get an auth token
      const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey })
      });
      
      const authData = await authRes.json();
      if (!authRes.ok) throw new Error(authData.detail || "Failed to authenticate with Paymob");
      const authToken = authData.token;

      // Step 3b: Call Paymob Disbursement API
      const amountCents = Math.round(amount * 100);
      let issuer = "vodafone"; // Default for Vodafone Cash
      if (methodType === "INSTAPAY") issuer = "instapay";
      else if (methodType === "BANK_TRANSFER") issuer = "bank"; // Depends on Paymob setup
      
      const disburseRes = await fetch('https://accept.paymob.com/api/acceptance/disbursements/disburse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: authToken,
          amount_cents: amountCents,
          issuer: issuer,
          account_number: accountDetails,
          merchant_order_id: result.transaction.id // Link to our internal transaction ID
        })
      });

      const disburseData = await disburseRes.json();
      if (!disburseRes.ok) throw new Error(disburseData.detail || disburseData.message || "Failed to disburse funds");

      // Paymob returns an ID for the transaction
      externalReferenceId = String(disburseData.id || `PAYMOB-${Date.now()}`);
      externalGatewaySuccess = true;
      
    } catch (gatewayError) {
      console.error('External Payment Gateway Error:', gatewayError);
      externalGatewaySuccess = false;
    }

    // 4. Handle Gateway Response
    if (externalGatewaySuccess) {
      // Update transaction to COMPLETED (or leave PENDING if waiting for a Webhook callback)
      // Deduct from pendingBalance since the money has officially left our platform.
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: result.transaction.id },
          data: { 
            status: 'COMPLETED',
            referenceId: externalReferenceId // Replace with the real Paymob reference
          }
        }),
        prisma.wallet.update({
          where: { id: result.wallet.id },
          data: {
            pendingBalance: { decrement: amount }
          }
        })
      ]);

      return NextResponse.json({
        success: true,
        message: 'Withdrawal processed successfully',
        transactionId: result.transaction.id,
      }, { status: 200 });

    } else {
      // If the gateway fails synchronously (e.g., invalid phone number, API down),
      // we MUST rollback the balances: restore availableBalance and reduce pendingBalance.
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: result.transaction.id },
          data: { status: 'FAILED' }
        }),
        prisma.wallet.update({
          where: { id: result.wallet.id },
          data: {
            availableBalance: { increment: amount },
            pendingBalance: { decrement: amount }
          }
        })
      ]);

      return NextResponse.json({
        error: 'Payment gateway failed. Funds have been returned to your available balance.'
      }, { status: 502 });
    }

  } catch (error: any) {
    console.error('Withdrawal API Error:', error);
    
    // Catch known DB transaction errors
    if (error.message === 'Wallet not found for this provider' || error.message === 'Insufficient available balance') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Generic fallback error
    return NextResponse.json({ error: 'Internal server error processing withdrawal' }, { status: 500 });
  }
}
