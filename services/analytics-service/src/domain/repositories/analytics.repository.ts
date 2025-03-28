import { Analytics, TimeRangeAnalytics } from '../entities/analytics.entity';

export interface AnalyticsRepository {
  findById(id: string): Promise<Analytics | null>;
  create(analytics: Analytics): Promise<Analytics>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Analytics[]>;
  
  // Advanced analytics queries
  getCarrierPerformance(carrierId: string, startDate: Date, endDate: Date): Promise<Analytics>;
  getRouteAnalytics(routeId: string, startDate: Date, endDate: Date): Promise<Analytics>;
  getShipmentMetrics(startDate: Date, endDate: Date): Promise<Analytics>;
  
  // Aggregation queries
  getTopCarriers(limit: number, startDate: Date, endDate: Date): Promise<Analytics[]>;
  getMostEfficientRoutes(limit: number, startDate: Date, endDate: Date): Promise<Analytics[]>;
  getRevenueTrend(startDate: Date, endDate: Date): Promise<Analytics[]>;
  
  // Cache management
  invalidateCache(startDate: Date, endDate: Date): Promise<void>;
} 