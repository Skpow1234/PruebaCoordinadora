import { Request, Response } from 'express';
import { z } from 'zod';
import { TrackingService } from '../../../application/services/tracking.service';
import { Location } from '../../../domain/entities/tracking.entity';

const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional()
});

const createTrackingSchema = z.object({
  shipmentId: z.string().uuid(),
  location: locationSchema,
  status: z.string()
});

const updateLocationSchema = z.object({
  location: locationSchema,
  status: z.string(),
  description: z.string().optional()
});

const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
});

export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  async createTracking(req: Request, res: Response) {
    try {
      const data = createTrackingSchema.parse(req.body);
      const tracking = await this.trackingService.createTracking(
        data.shipmentId,
        data.location,
        data.status
      );
      res.status(201).json(tracking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async updateLocation(req: Request, res: Response) {
    try {
      const { shipmentId } = req.params;
      const data = updateLocationSchema.parse(req.body);
      
      const tracking = await this.trackingService.updateLocation(
        shipmentId,
        data.location,
        data.status,
        data.description
      );
      
      res.json(tracking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else if (error instanceof Error && error.message === 'Tracking not found') {
        res.status(404).json({ error: 'Tracking not found' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getTracking(req: Request, res: Response) {
    try {
      const { shipmentId } = req.params;
      const tracking = await this.trackingService.findByShipmentId(shipmentId);
      
      if (!tracking) {
        res.status(404).json({ error: 'Tracking not found' });
      } else {
        res.json(tracking);
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getActiveTrackings(req: Request, res: Response) {
    try {
      const trackings = await this.trackingService.findActiveTrackings();
      res.json(trackings);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getTrackingsByDateRange(req: Request, res: Response) {
    try {
      const data = dateRangeSchema.parse(req.query);
      const trackings = await this.trackingService.findTrackingsByDateRange(
        new Date(data.startDate),
        new Date(data.endDate)
      );
      res.json(trackings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getTrackingsByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const trackings = await this.trackingService.findTrackingsByStatus(status);
      res.json(trackings);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 