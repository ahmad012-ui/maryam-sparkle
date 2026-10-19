import { createHmac, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

async function readRawBody(req: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const secret = process.env.SAFEPAY_SECRET_KEY;
  const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!secret || !webhookSecret || !serviceRole || !supabaseUrl) {
    return res.status(503).json({ error: 'Webhook is not configured.' });
  }

  let event: any;
  try {
    const raw = await readRawBody(req);
    const signature = req.headers['x-sfpy-signature'];
    if (typeof signature !== 'string' || !signature) return res.status(400).send('Missing Safepay signature.');
    const computed = createHmac('sha512', webhookSecret).update(raw).digest('hex');
    const supplied = signature.trim().toLowerCase();
    const expectedBuffer = Buffer.from(computed, 'hex');
    const suppliedBuffer = /^[a-f0-9]{128}$/.test(supplied) ? Buffer.from(supplied, 'hex') : Buffer.alloc(0);
    if (expectedBuffer.length !== suppliedBuffer.length || !timingSafeEqual(expectedBuffer, suppliedBuffer)) {
      throw new Error('Invalid signature');
    }
    event = JSON.parse(raw.toString('utf8'));
  } catch (error) {
    console.warn('Safepay webhook signature validation failed.');
    return res.status(400).send('Invalid webhook signature.');
  }

  if (event?.type !== 'payment.succeeded') return res.status(200).json({ received: true });
  const data = event.data || {};
  const tracker = typeof data.tracker === 'string' ? data.tracker : '';
  if (!tracker || data.currency !== 'PKR' || !Number.isFinite(Number(data.amount))) {
    return res.status(400).json({ error: 'Invalid payment event.' });
  }

  const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: payment, error: paymentError } = await admin
    .from('payments')
    .select('id, order_id, amount, transaction_reference, method, status')
    .eq('transaction_reference', tracker)
    .eq('method', 'safepay')
    .maybeSingle();
  if (paymentError || !payment) return res.status(404).json({ error: 'Payment tracker not found.' });

  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('id, order_number, total, payment_status')
    .eq('id', payment.order_id)
    .maybeSingle();
  if (orderError || !order) return res.status(404).json({ error: 'Order not found.' });

  const expectedAmount = Math.round(Number(order.total) * 100);
  const metadataOrderId = data.metadata?.order_id;
  if (Number(data.amount) !== expectedAmount || (metadataOrderId && metadataOrderId !== order.id)) {
    console.error('Safepay webhook amount/order mismatch for tracker:', tracker);
    return res.status(400).json({ error: 'Payment details did not match the order.' });
  }

  if (order.payment_status !== 'paid') {
    const now = new Date().toISOString();
    const { error: updatePaymentError } = await admin.from('payments')
      .update({ status: 'paid', paid_at: now, updated_at: now })
      .eq('id', payment.id);
    if (updatePaymentError) return res.status(500).json({ error: 'Could not update payment status.' });

    const { error: updateOrderError } = await admin.from('orders')
      .update({ payment_status: 'paid', updated_at: now })
      .eq('id', order.id);
    if (updateOrderError) return res.status(500).json({ error: 'Could not update order status.' });
  }

  return res.status(200).json({ received: true });
}
