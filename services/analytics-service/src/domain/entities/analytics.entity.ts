export interface CarrierPerformance {
  carrierId: string;
  totalShipments: number;
  completedShipments: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  totalDistance: number;
  averageSpeed: number;
}

export interface ShipmentMetrics {
  totalShipments: number;
  completedShipments: number;
  pendingShipments: number;
  inTransitShipments: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  totalRevenue: number;
  averageRevenuePerShipment: number;
}

export interface RouteAnalytics {
  routeId: string;
  totalShipments: number;
  completedShipments: number;
  averageDeliveryTime: number;
  totalDistance: number;
  averageSpeed: number;
  congestionLevel: number;
  efficiencyScore: number;
}

export interface TimeRangeAnalytics {
  startDate: Date;
  endDate: Date;
  metrics: ShipmentMetrics;
  carrierPerformance: CarrierPerformance[];
  routeAnalytics: RouteAnalytics[];
  dailyShipments: {
    date: Date;
    count: number;
    revenue: number;
  }[];
}

export class Analytics {
  constructor(
    public readonly id: string,
    public readonly timeRange: TimeRangeAnalytics,
    public readonly createdAt: Date = new Date()
  ) {}

  static create(timeRange: TimeRangeAnalytics): Analytics {
    return new Analytics(crypto.randomUUID(), timeRange);
  }

  public calculateEfficiencyScore(): number {
    const { metrics, carrierPerformance, routeAnalytics } = this.timeRange;

    // Calculate weighted average of various metrics
    const weights = {
      onTimeDelivery: 0.4,
      averageSpeed: 0.3,
      congestionLevel: 0.3
    };

    const onTimeDeliveryScore = metrics.onTimeDeliveryRate;
    const averageSpeedScore = carrierPerformance.reduce(
      (acc, carrier) => acc + carrier.averageSpeed,
      0
    ) / carrierPerformance.length;
    const congestionScore = routeAnalytics.reduce(
      (acc, route) => acc + (1 - route.congestionLevel),
      0
    ) / routeAnalytics.length;

    return (
      onTimeDeliveryScore * weights.onTimeDelivery +
      averageSpeedScore * weights.averageSpeed +
      congestionScore * weights.congestionLevel
    );
  }

  public getTopPerformingCarriers(limit: number = 5): CarrierPerformance[] {
    return [...this.timeRange.carrierPerformance]
      .sort((a, b) => b.onTimeDeliveryRate - a.onTimeDeliveryRate)
      .slice(0, limit);
  }

  public getMostEfficientRoutes(limit: number = 5): RouteAnalytics[] {
    return [...this.timeRange.routeAnalytics]
      .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
      .slice(0, limit);
  }

  public getRevenueTrend(): { date: Date; revenue: number }[] {
    return this.timeRange.dailyShipments.map(day => ({
      date: day.date,
      revenue: day.revenue
    }));
  }
} 