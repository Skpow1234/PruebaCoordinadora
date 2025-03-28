import { Analytics, TimeRangeAnalytics } from '../../domain/entities/analytics.entity';
import { AnalyticsRepository } from '../../domain/repositories/analytics.repository';
import { RedisClient } from '../../infrastructure/cache/redis.client';
import { RabbitMQClient } from '../../infrastructure/messaging/rabbitmq.client';

export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly cacheClient: RedisClient,
    private readonly messagingClient: RabbitMQClient
  ) {
    this.setupMessageHandlers();
  }

  private setupMessageHandlers(): void {
    // Listen for shipment status updates
    this.messagingClient.subscribe('shipment.*', async (message) => {
      const { shipmentId, status, carrierId, routeId } = message;
      
      // Invalidate relevant caches
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      
      await this.analyticsRepository.invalidateCache(startOfDay, endOfDay);
    });
  }

  private getCacheKey(prefix: string, startDate: Date, endDate: Date): string {
    return `${prefix}:${startDate.toISOString()}:${endDate.toISOString()}`;
  }

  async getShipmentMetrics(startDate: Date, endDate: Date): Promise<Analytics> {
    const cacheKey = this.getCacheKey('metrics', startDate, endDate);
    
    // Try to get from cache first
    const cached = await this.cacheClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const analytics = await this.analyticsRepository.getShipmentMetrics(startDate, endDate);
    
    // Cache for 5 minutes
    await this.cacheClient.set(cacheKey, JSON.stringify(analytics), 300);

    return analytics;
  }

  async getCarrierPerformance(
    carrierId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Analytics> {
    const cacheKey = this.getCacheKey(`carrier:${carrierId}`, startDate, endDate);
    
    // Try to get from cache first
    const cached = await this.cacheClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const analytics = await this.analyticsRepository.getCarrierPerformance(
      carrierId,
      startDate,
      endDate
    );
    
    // Cache for 5 minutes
    await this.cacheClient.set(cacheKey, JSON.stringify(analytics), 300);

    return analytics;
  }

  async getRouteAnalytics(
    routeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Analytics> {
    const cacheKey = this.getCacheKey(`route:${routeId}`, startDate, endDate);
    
    // Try to get from cache first
    const cached = await this.cacheClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const analytics = await this.analyticsRepository.getRouteAnalytics(
      routeId,
      startDate,
      endDate
    );
    
    // Cache for 5 minutes
    await this.cacheClient.set(cacheKey, JSON.stringify(analytics), 300);

    return analytics;
  }

  async getTopCarriers(
    limit: number,
    startDate: Date,
    endDate: Date
  ): Promise<Analytics[]> {
    const cacheKey = this.getCacheKey(`top_carriers:${limit}`, startDate, endDate);
    
    // Try to get from cache first
    const cached = await this.cacheClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const analytics = await this.analyticsRepository.getTopCarriers(
      limit,
      startDate,
      endDate
    );
    
    // Cache for 5 minutes
    await this.cacheClient.set(cacheKey, JSON.stringify(analytics), 300);

    return analytics;
  }

  async getMostEfficientRoutes(
    limit: number,
    startDate: Date,
    endDate: Date
  ): Promise<Analytics[]> {
    const cacheKey = this.getCacheKey(`efficient_routes:${limit}`, startDate, endDate);
    
    // Try to get from cache first
    const cached = await this.cacheClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const analytics = await this.analyticsRepository.getMostEfficientRoutes(
      limit,
      startDate,
      endDate
    );
    
    // Cache for 5 minutes
    await this.cacheClient.set(cacheKey, JSON.stringify(analytics), 300);

    return analytics;
  }

  async getRevenueTrend(startDate: Date, endDate: Date): Promise<Analytics[]> {
    const cacheKey = this.getCacheKey('revenue_trend', startDate, endDate);
    
    // Try to get from cache first
    const cached = await this.cacheClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const analytics = await this.analyticsRepository.getRevenueTrend(
      startDate,
      endDate
    );
    
    // Cache for 5 minutes
    await this.cacheClient.set(cacheKey, JSON.stringify(analytics), 300);

    return analytics;
  }

  async createAnalytics(timeRange: TimeRangeAnalytics): Promise<Analytics> {
    const analytics = Analytics.create(timeRange);
    return this.analyticsRepository.create(analytics);
  }

  async findById(id: string): Promise<Analytics | null> {
    return this.analyticsRepository.findById(id);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Analytics[]> {
    return this.analyticsRepository.findByDateRange(startDate, endDate);
  }
} 