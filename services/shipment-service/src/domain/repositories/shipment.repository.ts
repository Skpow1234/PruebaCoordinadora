import { Shipment, ShipmentStatus } from '../entities/shipment.entity';

export interface ShipmentRepository {
  findById(id: string): Promise<Shipment | null>;
  findByUserId(userId: string): Promise<Shipment[]>;
  findByStatus(status: ShipmentStatus): Promise<Shipment[]>;
  findByCarrierId(carrierId: string): Promise<Shipment[]>;
  create(shipment: Shipment): Promise<Shipment>;
  update(shipment: Shipment): Promise<Shipment>;
  delete(id: string): Promise<void>;
  
  // Advanced queries for analytics
  findByDateRange(startDate: Date, endDate: Date): Promise<Shipment[]>;
  countByStatus(status: ShipmentStatus): Promise<number>;
  findActiveShipmentsByCarrier(carrierId: string): Promise<Shipment[]>;
} 