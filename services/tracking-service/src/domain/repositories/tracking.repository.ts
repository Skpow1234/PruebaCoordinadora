import { Tracking } from '../entities/tracking.entity';

export interface TrackingRepository {
  findById(id: string): Promise<Tracking | null>;
  findByShipmentId(shipmentId: string): Promise<Tracking | null>;
  create(tracking: Tracking): Promise<Tracking>;
  update(tracking: Tracking): Promise<Tracking>;
  delete(id: string): Promise<void>;
  
  // Advanced queries
  findActiveTrackings(): Promise<Tracking[]>;
  findTrackingsByDateRange(startDate: Date, endDate: Date): Promise<Tracking[]>;
  findTrackingsByStatus(status: string): Promise<Tracking[]>;
} 