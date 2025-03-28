import mysql from 'mysql2/promise';
import { Analytics, TimeRangeAnalytics } from '../../domain/entities/analytics.entity';
import { AnalyticsRepository } from '../../domain/repositories/analytics.repository';

export class MySQLAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly pool: mysql.Pool) {}

  private mapToAnalytics(row: any): Analytics {
    return new Analytics(
      row.id,
      JSON.parse(row.time_range) as TimeRangeAnalytics,
      new Date(row.created_at)
    );
  }

  async findById(id: string): Promise<Analytics | null> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM analytics WHERE id = ?',
      [id]
    );

    const analytics = (rows as any[])[0];
    return analytics ? this.mapToAnalytics(analytics) : null;
  }

  async create(analytics: Analytics): Promise<Analytics> {
    await this.pool.execute(
      `INSERT INTO analytics (id, time_range, created_at)
       VALUES (?, ?, ?)`,
      [
        analytics.id,
        JSON.stringify(analytics.timeRange),
        analytics.createdAt
      ]
    );

    return analytics;
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Analytics[]> {
    const [rows] = await this.pool.execute(
      `SELECT * FROM analytics 
       WHERE JSON_EXTRACT(time_range, '$.startDate') >= ?
       AND JSON_EXTRACT(time_range, '$.endDate') <= ?
       ORDER BY created_at DESC`,
      [startDate, endDate]
    );

    return (rows as any[]).map(this.mapToAnalytics);
  }

  async getCarrierPerformance(
    carrierId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Analytics> {
    const [rows] = await this.pool.execute(
      `SELECT a.*, 
              COUNT(s.id) as total_shipments,
              COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) as completed_shipments,
              AVG(TIMESTAMPDIFF(HOUR, s.created_at, s.updated_at)) as avg_delivery_time,
              COUNT(CASE WHEN s.status = 'delivered' AND s.updated_at <= s.estimated_delivery THEN 1 END) / COUNT(s.id) as on_time_rate,
              SUM(s.distance) as total_distance,
              AVG(s.average_speed) as avg_speed
       FROM analytics a
       JOIN shipments s ON s.carrier_id = ?
       WHERE s.created_at BETWEEN ? AND ?
       GROUP BY a.id`,
      [carrierId, startDate, endDate]
    );

    const analytics = (rows as any[])[0];
    return analytics ? this.mapToAnalytics(analytics) : null;
  }

  async getRouteAnalytics(
    routeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Analytics> {
    const [rows] = await this.pool.execute(
      `SELECT a.*, 
              COUNT(s.id) as total_shipments,
              COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) as completed_shipments,
              AVG(TIMESTAMPDIFF(HOUR, s.created_at, s.updated_at)) as avg_delivery_time,
              SUM(s.distance) as total_distance,
              AVG(s.average_speed) as avg_speed,
              AVG(s.congestion_level) as congestion_level,
              (COUNT(CASE WHEN s.status = 'delivered' AND s.updated_at <= s.estimated_delivery THEN 1 END) / COUNT(s.id)) * 
              (1 - AVG(s.congestion_level)) * 
              (AVG(s.average_speed) / 100) as efficiency_score
       FROM analytics a
       JOIN shipments s ON s.route_id = ?
       WHERE s.created_at BETWEEN ? AND ?
       GROUP BY a.id`,
      [routeId, startDate, endDate]
    );

    const analytics = (rows as any[])[0];
    return analytics ? this.mapToAnalytics(analytics) : null;
  }

  async getShipmentMetrics(startDate: Date, endDate: Date): Promise<Analytics> {
    const [rows] = await this.pool.execute(
      `SELECT a.*, 
              COUNT(s.id) as total_shipments,
              COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) as completed_shipments,
              COUNT(CASE WHEN s.status = 'pending' THEN 1 END) as pending_shipments,
              COUNT(CASE WHEN s.status = 'in_transit' THEN 1 END) as in_transit_shipments,
              AVG(TIMESTAMPDIFF(HOUR, s.created_at, s.updated_at)) as avg_delivery_time,
              COUNT(CASE WHEN s.status = 'delivered' AND s.updated_at <= s.estimated_delivery THEN 1 END) / COUNT(s.id) as on_time_rate,
              SUM(s.revenue) as total_revenue,
              AVG(s.revenue) as avg_revenue_per_shipment
       FROM analytics a
       JOIN shipments s ON s.created_at BETWEEN ? AND ?
       GROUP BY a.id`,
      [startDate, endDate]
    );

    const analytics = (rows as any[])[0];
    return analytics ? this.mapToAnalytics(analytics) : null;
  }

  async getTopCarriers(
    limit: number,
    startDate: Date,
    endDate: Date
  ): Promise<Analytics[]> {
    const [rows] = await this.pool.execute(
      `SELECT a.*, 
              c.id as carrier_id,
              COUNT(s.id) as total_shipments,
              COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) as completed_shipments,
              AVG(TIMESTAMPDIFF(HOUR, s.created_at, s.updated_at)) as avg_delivery_time,
              COUNT(CASE WHEN s.status = 'delivered' AND s.updated_at <= s.estimated_delivery THEN 1 END) / COUNT(s.id) as on_time_rate,
              SUM(s.distance) as total_distance,
              AVG(s.average_speed) as avg_speed
       FROM analytics a
       JOIN shipments s ON s.carrier_id = c.id
       JOIN carriers c ON c.id = s.carrier_id
       WHERE s.created_at BETWEEN ? AND ?
       GROUP BY c.id
       ORDER BY on_time_rate DESC
       LIMIT ?`,
      [startDate, endDate, limit]
    );

    return (rows as any[]).map(this.mapToAnalytics);
  }

  async getMostEfficientRoutes(
    limit: number,
    startDate: Date,
    endDate: Date
  ): Promise<Analytics[]> {
    const [rows] = await this.pool.execute(
      `SELECT a.*, 
              r.id as route_id,
              COUNT(s.id) as total_shipments,
              COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) as completed_shipments,
              AVG(TIMESTAMPDIFF(HOUR, s.created_at, s.updated_at)) as avg_delivery_time,
              SUM(s.distance) as total_distance,
              AVG(s.average_speed) as avg_speed,
              AVG(s.congestion_level) as congestion_level,
              (COUNT(CASE WHEN s.status = 'delivered' AND s.updated_at <= s.estimated_delivery THEN 1 END) / COUNT(s.id)) * 
              (1 - AVG(s.congestion_level)) * 
              (AVG(s.average_speed) / 100) as efficiency_score
       FROM analytics a
       JOIN shipments s ON s.route_id = r.id
       JOIN routes r ON r.id = s.route_id
       WHERE s.created_at BETWEEN ? AND ?
       GROUP BY r.id
       ORDER BY efficiency_score DESC
       LIMIT ?`,
      [startDate, endDate, limit]
    );

    return (rows as any[]).map(this.mapToAnalytics);
  }

  async getRevenueTrend(startDate: Date, endDate: Date): Promise<Analytics[]> {
    const [rows] = await this.pool.execute(
      `SELECT a.*, 
              DATE(s.created_at) as date,
              COUNT(s.id) as shipment_count,
              SUM(s.revenue) as daily_revenue
       FROM analytics a
       JOIN shipments s ON s.created_at BETWEEN ? AND ?
       GROUP BY DATE(s.created_at)
       ORDER BY date ASC`,
      [startDate, endDate]
    );

    return (rows as any[]).map(this.mapToAnalytics);
  }

  async invalidateCache(startDate: Date, endDate: Date): Promise<void> {
    // Invalidate all cache keys for the given date range
    const cacheKeys = [
      `metrics:${startDate.toISOString()}:${endDate.toISOString()}`,
      `revenue_trend:${startDate.toISOString()}:${endDate.toISOString()}`
    ];

    for (const key of cacheKeys) {
      await this.pool.execute('DELETE FROM cache WHERE key = ?', [key]);
    }
  }
} 