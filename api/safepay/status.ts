import Safepay from '@sfpy/node-core';
import { createClient } from '@supabase/supabase-js';

const json = (res: any, status: number, body: Record<string, unknown>) =>
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  const secret = process.env.SAFEPAY_SECRET_KEY;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!secret || !serviceRole || !supabaseUrl) return json(res, 503, { error: 'Payment status is not configured.' });

  const orderNumber = typeof req.body?.orderNumber === 'string' ? req.body.orderNumber : '';
  const tracker = typeof req.body?.tracker === 'string' ? req.body.tracker : '';
  if (!/^MS-[A-Z0-9-]{3,30}$/i.test(orderNumber) || !/^track_[a-zA-Z0-9-]+$/.test(tracker)) {
    return json(res, 400, { error: 'Invalid payment reference.' });
  }

  const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: order, error: orderError } = await admin.from('orders')
    .select('id, order_number, total, payment_status')
    .eq('order_number', orderNumber)
    .maybeSingle();
  if (orderError || !order) return json(res, 404, { error: 'Order not found.' });

  const { data: payment, error: paymentError } = await admin.from('payments')
    .select('id, order_id, transaction_reference, method, status')
    .eq('order_id', order.id)
    .eq('method', 'safepay')
    .eq('transaction_reference', tracker)
    .maybeSingle();
  if (paymentError || !payment) return json(res, 403, { error: 'Payment reference does not match this order.' });
  if (order.payment_status === 'paid' || payment.status === 'paid') return json(res, 200, { status: 'paid', orderNumber });

  try {
    const environment = process.env.SAFEPAY_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
    const host = environment === 'production' ? 'https://api.getsafepay.com' : 'https://sandbox.api.getsafepay.com';
    const safepay = new Safepay(secret, { authType: 'secret', host });
    const response = await safepay.reporter.payments.fetch(tracker);
    const data = response?.data || {};
    const state = data?.tracker?.state || 'TRACKER_STARTED';

    if (state === 'TRACKER_ENDED') {
      const baseAmount = data?.tracker?.purchase_totals?.base_amount;
      const actualAmount = Number(baseAmount?.amount);
      if (baseAmount?.currency !== 'PKR' || !Number.isFinite(actualAmount) || actualAmount !== Math.round(Number(order.total) * 100)) {
        console.error('Safepay status amount mismatch for order:', orderNumber);
        return json(res, 409, { status: 'pending', error: 'Payment verification is still pending. Please contact support if you were charged.' });
      }

      const now = new Date().toISOString();
      const { error: updatePaymentError } = await admin.from('payments')
        .update({ status: 'paid', paid_at: now, updated_at: now }).eq('id', payment.id);
      if (updatePaymentError) throw updatePaymentError;
      const { error: updateOrderError } = await admin.from('orders')
        .update({ payment_status: 'paid', updated_at: now }).eq('id', order.id);
      if (updateOrderError) throw updateOrderError;
      return json(res, 200, { status: 'paid', orderNumber });
    }

    if (state === 'TRACKER_CANCELLED' || state === 'TRACKER_EXPIRED') {
      return json(res, 200, { status: 'cancelled', orderNumber });
    }
    return json(res, 200, { status: 'pending', orderNumber });
  } catch (error) {
    console.error('Safepay status check failed:', error);
    return json(res, 502, { status: 'pending', error: 'Could not verify payment yet.' });
  }
}
