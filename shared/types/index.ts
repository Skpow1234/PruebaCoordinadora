export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  TRANSPORTER = 'transporter'
}

export enum ShipmentStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered'
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shipment {
  id: string;
  userId: string;
  packageDetails: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
  destinationAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  status: ShipmentStatus;
  carrierId?: string;
  routeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  id: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalShipments: number;
    completedShipments: number;
    averageDeliveryTime: number;
    revenue: number;
  };
  carrierPerformance: {
    [carrierId: string]: {
      totalShipments: number;
      completedShipments: number;
      averageDeliveryTime: number;
      onTimeDeliveryRate: number;
    };
  };
  routeAnalytics: {
    [routeId: string]: {
      totalShipments: number;
      averageDeliveryTime: number;
      efficiencyScore: number;
    };
  };
  createdAt: Date;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
} 