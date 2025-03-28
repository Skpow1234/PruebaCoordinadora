import { Router } from 'express';
import { TrackingController } from '../controllers/tracking.controller';
import { AuthMiddleware } from '../../../shared/middleware/auth.middleware';
import { UserRole } from '../../../shared/types/user.types';

export function createTrackingRouter(
  trackingController: TrackingController,
  authMiddleware: AuthMiddleware
): Router {
  const router = Router();

  // Protected routes
  router.use(authMiddleware.authenticate);

  // User routes
  router.get('/tracking/:shipmentId', trackingController.getTracking.bind(trackingController));

  // Transporter routes
  router.post(
    '/tracking',
    authMiddleware.authorize([UserRole.TRANSPORTER]),
    trackingController.createTracking.bind(trackingController)
  );

  router.put(
    '/tracking/:shipmentId/location',
    authMiddleware.authorize([UserRole.TRANSPORTER]),
    trackingController.updateLocation.bind(trackingController)
  );

  // Admin routes
  router.get(
    '/tracking/active',
    authMiddleware.authorize([UserRole.ADMIN]),
    trackingController.getActiveTrackings.bind(trackingController)
  );

  router.get(
    '/tracking/date-range',
    authMiddleware.authorize([UserRole.ADMIN]),
    trackingController.getTrackingsByDateRange.bind(trackingController)
  );

  router.get(
    '/tracking/status/:status',
    authMiddleware.authorize([UserRole.ADMIN]),
    trackingController.getTrackingsByStatus.bind(trackingController)
  );

  return router;
} 