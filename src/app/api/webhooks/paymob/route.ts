import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const payload = JSON.parse(bodyText);

    // Paymob HMAC is usually sent in the query params (hmac) for transactions.
    const url = new URL(req.url);
    const receivedHmac = url.searchParams.get('hmac');

    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (!hmacSecret) {
      console.error('PAYMOB_HMAC_SECRET is not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (receivedHmac) {
      const obj = payload.obj;
      // Standard Paymob HMAC fields 
      const hmacString = [
        obj.amount_cents,
        obj.created_at,
        obj.currency,
        obj.error_occured,
        obj.has_parent_transaction,
        obj.id,
        obj.integration_id,
        obj.is_3d_secure,
        obj.is_auth,
        obj.is_capture,
        obj.is_refunded,
        obj.is_standalone_payment,
        obj.is_voided,
        obj.order.id,
        obj.owner,
        obj.pending,
        obj.source_data.pan,
        obj.source_data.sub_type,
        obj.source_data.type,
        obj.success
      ].join('');

      const calculatedHmac = crypto
        .createHmac('sha512', hmacSecret)
        .update(hmacString)
        .digest('hex');

      // if (calculatedHmac !== receivedHmac) {
      //   console.error('HMAC validation failed!');
      //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      // }
    }

    if (payload.type === 'TRANSACTION' || payload.type === 'DISBURSEMENT') {
      const transactionData = payload.obj;
      const gatewayTransactionId = String(transactionData.id);
      const isSuccess = transactionData.success;
      
      const internalReference = transactionData.merchant_order_id || transactionData.order?.merchant_order_id; 

      if (!internalReference) {
        console.warn('Webhook received without a merchant_order_id mapping');
        return NextResponse.json({ success: true });
      }

      const internalTx = await prisma.transaction.findUnique({
        where: { id: internalReference }
      });

      if (!internalTx || internalTx.status !== 'PENDING') {
        console.log(`Transaction ${internalReference} is already processed or not found`);
        return NextResponse.json({ success: true });
      }

      await prisma.$transaction(async (tx) => {
        if (isSuccess) {
          await tx.transaction.update({
            where: { id: internalTx.id },
            data: { status: 'COMPLETED', referenceId: gatewayTransactionId }
          });
          
          await tx.wallet.update({
            where: { id: internalTx.walletId },
            data: { pendingBalance: { decrement: internalTx.amount } }
          });
        } else {
          await tx.transaction.update({
            where: { id: internalTx.id },
            data: { status: 'FAILED', referenceId: gatewayTransactionId }
          });

          await tx.wallet.update({
            where: { id: internalTx.walletId },
            data: { 
              pendingBalance: { decrement: internalTx.amount },
              availableBalance: { increment: internalTx.amount }
            }
          });
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Paymob Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
