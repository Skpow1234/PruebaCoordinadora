import { Request, Response } from 'express';
import { z } from 'zod';
import { AnalyticsService } from '../../../application/services/analytics.service';

const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
});

const limitSchema = z.object({
  limit: z.number().min(1).max(100).default(5)
});

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async getShipmentMetrics(req: Request, res: Response) {
    try {
      const data = dateRangeSchema.parse(req.query);
      const analytics = await this.analyticsService.getShipmentMetrics(
        new Date(data.startDate),
        new Date(data.endDate)
      );
      res.json(analytics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getCarrierPerformance(req: Request, res: Response) {
    try {
      const { carrierId } = req.params;
      const data = dateRangeSchema.parse(req.query);
      
      const analytics = await this.analyticsService.getCarrierPerformance(
        carrierId,
        new Date(data.startDate),
        new Date(data.endDate)
      );
      
      if (!analytics) {
        res.status(404).json({ error: 'Carrier not found' });
      } else {
        res.json(analytics);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getRouteAnalytics(req: Request, res: Response) {
    try {
      const { routeId } = req.params;
      const data = dateRangeSchema.parse(req.query);
      
      const analytics = await this.analyticsService.getRouteAnalytics(
        routeId,
        new Date(data.startDate),
        new Date(data.endDate)
      );
      
      if (!analytics) {
        res.status(404).json({ error: 'Route not found' });
      } else {
        res.json(analytics);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getTopCarriers(req: Request, res: Response) {
    try {
      const data = {
        ...dateRangeSchema.parse(req.query),
        ...limitSchema.parse(req.query)
      };
      
      const analytics = await this.analyticsService.getTopCarriers(
        data.limit,
        new Date(data.startDate),
        new Date(data.endDate)
      );
      
      res.json(analytics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getMostEfficientRoutes(req: Request, res: Response) {
    try {
      const data = {
        ...dateRangeSchema.parse(req.query),
        ...limitSchema.parse(req.query)
      };
      
      const analytics = await this.analyticsService.getMostEfficientRoutes(
        data.limit,
        new Date(data.startDate),
        new Date(data.endDate)
      );
      
      res.json(analytics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getRevenueTrend(req: Request, res: Response) {
    try {
      const data = dateRangeSchema.parse(req.query);
      const analytics = await this.analyticsService.getRevenueTrend(
        new Date(data.startDate),
        new Date(data.endDate)
      );
      res.json(analytics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
} 