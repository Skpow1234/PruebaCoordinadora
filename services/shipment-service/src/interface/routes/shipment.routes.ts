import { Router } from 'express';
import { ShipmentController } from '../controllers/shipment.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { UserRole } from '../../../auth-service/src/domain/entities/user.entity';

export function createShipmentRouter(
  shipmentController: ShipmentController,
  authMiddleware: AuthMiddleware
): Router {
  const router = Router();

  // Protected routes
  router.use(authMiddleware.authenticate);

  // User routes
  router.post('/', (req, res) => shipmentController.createShipment(req, res));
  router.get('/user', (req, res) => shipmentController.getUserShipments(req, res));
  router.get('/:id', (req, res) => shipmentController.getShipment(req, res));

  // Admin and transporter routes
  router.use(authMiddleware.authorize([UserRole.ADMIN, UserRole.TRANSPORTER]));
  router.post('/:id/assign', (req, res) => shipmentController.assignCarrier(req, res));
  router.post('/:id/deliver', (req, res) => shipmentController.markAsDelivered(req, res));
  router.get('/status/:status', (req, res) => shipmentController.getShipmentsByStatus(req, res));
  router.get('/analytics/date-range', (req, res) => shipmentController.getShipmentsByDateRange(req, res));
  router.get('/analytics/status/:status/count', (req, res) => shipmentController.getShipmentCountByStatus(req, res));

  return router;
} 