import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

function apiMockPlugin(): Plugin {
  return {
    name: 'api-mock-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        // Handle POST /api/v1/orders
        if (req.url.startsWith('/api/v1/orders') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const randomNum = Math.floor(1000 + Math.random() * 9000);
              const orderNumber = data.order_number || `MS-${randomNum}`;
              const createdOrder = {
                id: randomNum,
                order_number: orderNumber,
                created_at: new Date().toISOString(),
                status: 'placed',
                customer_name: data.customer?.name || 'Customer',
                customer_email: data.customer?.email || '',
                customer_phone: data.customer?.phone || '',
                shipping_address: data.shipping_address || {},
                delivery_method: data.delivery_method || 'standard',
                payment_method: data.payment_method || 'cod',
                payment_status: 'Pending',
                subtotal: 0,
                shipping_fee: 200,
                discount: 0,
                total: 0,
                items: [],
                notes: data.notes || '',
              };
              res.statusCode = 201;
              res.end(
                JSON.stringify({
                  success: true,
                  message: 'Order created successfully',
                  data: { order: createdOrder },
                })
              );
            } catch {
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, data: {} }));
            }
          });
          return;
        }

        // Handle GET /api/v1/orders/track
        if (req.url.startsWith('/api/v1/orders/track')) {
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, data: { order: null } }));
          return;
        }

        // Handle GET /api/v1/orders
        if (req.url.startsWith('/api/v1/orders') && req.method === 'GET') {
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, data: { orders: [] } }));
          return;
        }

        // Handle Media upload endpoint
        if (req.url.startsWith('/api/v1/media/upload') && req.method === 'POST') {
          const uniqueId = Math.random().toString(36).substring(2, 10);
          const timestamp = Date.now();
          const mockUrl = `/uploads/payment-proofs/${uniqueId}_${timestamp}.jpg`;
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              success: true,
              message: 'File uploaded successfully',
              data: { url: mockUrl },
            })
          );
          return;
        }

        // Handle Cart endpoints
        if (req.url.startsWith('/api/v1/cart')) {
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              success: true,
              data: { id: 1, items: [], item_count: 0, total: 0 },
            })
          );
          return;
        }

        // Fallback for other API routes
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, data: null }));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMockPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
