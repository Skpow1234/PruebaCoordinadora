import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { AuthMiddleware } from '../../../shared/middleware/auth.middleware';
import { UserRole } from '../../../shared/types/user.types';

export function createAnalyticsRouter(
  analyticsController: AnalyticsController,
  authMiddleware: AuthMiddleware
): Router {
  const router = Router();

  // All routes require admin access
  router.use(authMiddleware.authenticate);
  router.use(authMiddleware.authorize([UserRole.ADMIN]));

  // Shipment metrics
  router.get('/metrics', analyticsController.getShipmentMetrics.bind(analyticsController));

  // Carrier analytics
  router.get('/carriers/:carrierId', analyticsController.getCarrierPerformance.bind(analyticsController));
  router.get('/carriers/top', analyticsController.getTopCarriers.bind(analyticsController));

  // Route analytics
  router.get('/routes/:routeId', analyticsController.getRouteAnalytics.bind(analyticsController));
  router.get('/routes/efficient', analyticsController.getMostEfficientRoutes.bind(analyticsController));

  // Revenue analytics
  router.get('/revenue/trend', analyticsController.getRevenueTrend.bind(analyticsController));

  return router;
} 