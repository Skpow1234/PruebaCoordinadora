import { Request, Response } from 'express';
import { z } from 'zod';
import { ShipmentService } from '../../application/services/shipment.service';
import { ShipmentStatus } from '../../domain/entities/shipment.entity';

const packageDetailsSchema = z.object({
  weight: z.number().positive(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive()
  }),
  productType: z.string()
});

const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string()
});

const createShipmentSchema = z.object({
  packageDetails: packageDetailsSchema,
  destinationAddress: addressSchema
});

const assignCarrierSchema = z.object({
  carrierId: z.string().uuid(),
  routeId: z.string().uuid()
});

const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
});

export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  async createShipment(req: Request, res: Response): Promise<void> {
    try {
      const { packageDetails, destinationAddress } = createShipmentSchema.parse(req.body);
      const userId = req.user!.id;

      const shipment = await this.shipmentService.createShipment(
        userId,
        packageDetails,
        destinationAddress
      );

      res.status(201).json(shipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async assignCarrier(req: Request, res: Response): Promise<void> {
    try {
      const { carrierId, routeId } = assignCarrierSchema.parse(req.body);
      const shipmentId = req.params.id;

      const shipment = await this.shipmentService.assignCarrier(
        shipmentId,
        carrierId,
        routeId
      );

      res.json(shipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async markAsDelivered(req: Request, res: Response): Promise<void> {
    try {
      const shipmentId = req.params.id;
      const shipment = await this.shipmentService.markAsDelivered(shipmentId);
      res.json(shipment);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getShipment(req: Request, res: Response): Promise<void> {
    try {
      const shipmentId = req.params.id;
      const shipment = await this.shipmentService.getShipmentById(shipmentId);

      if (!shipment) {
        res.status(404).json({ error: 'Shipment not found' });
        return;
      }

      res.json(shipment);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getUserShipments(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const shipments = await this.shipmentService.getShipmentsByUserId(userId);
      res.json(shipments);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getShipmentsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = req.params.status as ShipmentStatus;
      const shipments = await this.shipmentService.getShipmentsByStatus(status);
      res.json(shipments);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getShipmentsByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = dateRangeSchema.parse(req.query);
      const shipments = await this.shipmentService.getShipmentsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
      res.json(shipments);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getShipmentCountByStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = req.params.status as ShipmentStatus;
      const count = await this.shipmentService.getShipmentCountByStatus(status);
      res.json({ count });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
} 