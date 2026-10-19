import Safepay from '@sfpy/node-core';
import { createClient } from '@supabase/supabase-js';

const json = (res: any, status: number, body: Record<string, unknown>) =>
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });

  const appUrl = process.env.APP_URL || 'https://maryam-sparkle.vercel.app';
  const origin = req.headers.origin;
  if (origin && origin !== appUrl && origin !== appUrl.replace(/\/$/, '')) {
    return json(res, 403, { error: 'Origin not allowed.' });
  }

  const secret = process.env.SAFEPAY_SECRET_KEY;
  const publicKey = process.env.SAFEPAY_API_KEY;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!secret || !publicKey || !serviceRole || !supabaseUrl) {
    return json(res, 503, { error: 'Online payments are not configured yet. Please choose another payment method.' });
  }

  const orderId = typeof req.body?.orderId === 'string' ? req.body.orderId : '';
  const orderNumber = typeof req.body?.orderNumber === 'string' ? req.body.orderNumber : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const phone = typeof req.body?.phone === 'string' ? req.body.phone.replace(/\s+/g, '') : '';
  if (!orderId || !orderNumber || !email || !phone) {
    return json(res, 400, { error: 'Order details are incomplete. Please review checkout and try again.' });
  }

  const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('id, order_number, customer_email, customer_phone, total, payment_status, payment_method')
    .eq('id', orderId)
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (orderError || !order) return json(res, 404, { error: 'Order not found. Please contact support if you were charged.' });
  if ((order.customer_email || '').toLowerCase() !== email || (order.customer_phone || '').replace(/\s+/g, '') !== phone) {
    return json(res, 403, { error: 'The order details could not be verified.' });
  }
  if (order.payment_method !== 'safepay' || order.payment_status !== 'pending' || !Number.isFinite(Number(order.total)) || Number(order.total) <= 0) {
    return json(res, 409, { error: 'This order is not eligible for online payment.' });
  }

  try {
    const environment = process.env.SAFEPAY_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
    const host = environment === 'production' ? 'https://api.getsafepay.com' : 'https://sandbox.api.getsafepay.com';
    const safepay = new Safepay(secret, { authType: 'secret', host });

    const existing = await admin.from('payments').select('transaction_reference').eq('order_id', order.id).eq('method', 'safepay').maybeSingle();
    if (existing.data?.transaction_reference?.startsWith('track_')) {
      // Create a fresh checkout token for the same pending tracker to support safe retries.
      const auth = await safepay.auth.passport.create();
      const checkoutUrl = safepay.checkouts.payment.create({
        tracker: existing.data.transaction_reference,
        tbt: auth.data,
        environment,
        source: 'hosted',
        redirect_url: `${appUrl}/payment-result?order=${encodeURIComponent(order.order_number)}`,
        cancel_url: `${appUrl}/payment-result?order=${encodeURIComponent(order.order_number)}&cancelled=1`,
      });
      return json(res, 200, { checkoutUrl });
    }

    const session = await safepay.payments.session.setup({
      merchant_api_key: publicKey,
      intent: 'CYBERSOURCE',
      mode: 'payment',
      entry_mode: 'raw',
      currency: 'PKR',
      amount: Math.round(Number(order.total) * 100),
      metadata: { order_id: order.id, order_number: order.order_number },
      include_fees: false,
    });
    const tracker = session?.data?.tracker?.token;
    if (typeof tracker !== 'string' || !tracker.startsWith('track_')) {
      throw new Error('Safepay did not return a valid payment tracker.');
    }

    const { error: saveError } = await admin
      .from('payments')
      .update({ transaction_reference: tracker, updated_at: new Date().toISOString() })
      .eq('order_id', order.id)
      .eq('method', 'safepay');
    if (saveError) throw saveError;

    const auth = await safepay.auth.passport.create();
    const checkoutUrl = safepay.checkouts.payment.create({
      tracker,
      tbt: auth.data,
      environment,
      source: 'hosted',
      redirect_url: `${appUrl}/payment-result?order=${encodeURIComponent(order.order_number)}`,
      cancel_url: `${appUrl}/payment-result?order=${encodeURIComponent(order.order_number)}&cancelled=1`,
    });
    return json(res, 200, { checkoutUrl });
  } catch (error) {
    console.error('Safepay checkout initialization failed:', error);
    return json(res, 502, { error: 'We could not start the secure payment page. Your order is still pending; retry checkout or contact support before placing another order.' });
  }
}
