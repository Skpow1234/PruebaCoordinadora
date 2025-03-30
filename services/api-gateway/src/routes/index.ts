import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import config from '../config';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@logistics/shared';

const router = Router();

// Auth Service Routes
router.use('/auth', createProxyMiddleware({
  target: config.services.auth.url,
  changeOrigin: true,
  pathRewrite: {
    '^/auth': ''
  },
  onProxyReq: (proxyReq) => {
    proxyReq.setTimeout(config.services.auth.timeout);
  }
}));

// Shipment Service Routes
router.use('/shipments', authenticate, createProxyMiddleware({
  target: config.services.shipment.url,
  changeOrigin: true,
  pathRewrite: {
    '^/shipments': ''
  },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setTimeout(config.services.shipment.timeout);
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.id);
      proxyReq.setHeader('X-User-Role', req.user.role);
    }
  }
}));

// Analytics Service Routes (Admin only)
router.use('/analytics', authenticate, authorize([UserRole.ADMIN]), createProxyMiddleware({
  target: config.services.analytics.url,
  changeOrigin: true,
  pathRewrite: {
    '^/analytics': ''
  },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setTimeout(config.services.analytics.timeout);
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.id);
      proxyReq.setHeader('X-User-Role', req.user.role);
    }
  }
}));

// Health Check Route
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router; 