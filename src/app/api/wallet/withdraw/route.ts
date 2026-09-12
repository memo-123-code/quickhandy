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

    // 3. Initiate External Gateway Request (e.g., Paymob Disbursement)
    // ----------------------------------------------------------------------
    // NOTE: In a production FinTech app, you would call external APIs here 
    // using environment variables like process.env.PAYMOB_SECRET_KEY.
    //
    // Theoretical Flow for Paymob Disbursement:
    // a. Authenticate using API Key to get an auth token.
    // b. Call the Disbursement API endpoint:
    //    POST https://accept.paymob.com/api/acceptance/disbursements/withdraw
    //    Body: {
    //      "amount": amount,
    //      "currency": "EGP",
    //      "issuer": methodType === 'VODAFONE_CASH' ? "vodafone" : "instapay",
    //      "account_number": accountDetails // The phone number or InstaPay address
    //    }
    //
    // c. Receive the Gateway Transaction ID.
    // ----------------------------------------------------------------------
    
    let externalGatewaySuccess = false;
    let externalReferenceId = null;

    try {
      // === MOCK GATEWAY CALL ===
      // const response = await fetch('https://accept.paymob.com/api/acceptance/disbursements', {
      //   method: 'POST',
      //   headers: { 
      //      'Authorization': `Bearer ${process.env.PAYMOB_SECRET_KEY}`,
      //      'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ amount, account_number: accountDetails })
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message);
      // externalReferenceId = data.id;
      // externalGatewaySuccess = true;

      // For this implementation, we simulate a successful gateway response
      externalGatewaySuccess = true;
      externalReferenceId = `PAYMOB-${Date.now()}`;
      
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
