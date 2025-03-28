import mysql from 'mysql2/promise';
import { Shipment, ShipmentStatus, PackageDetails, Address } from '../../domain/entities/shipment.entity';
import { ShipmentRepository } from '../../domain/repositories/shipment.repository';

export class MySQLShipmentRepository implements ShipmentRepository {
  constructor(private readonly pool: mysql.Pool) {}

  private mapToShipment(row: any): Shipment {
    return new Shipment(
      row.id,
      row.user_id,
      JSON.parse(row.package_details) as PackageDetails,
      JSON.parse(row.destination_address) as Address,
      row.status as ShipmentStatus,
      row.carrier_id,
      row.route_id,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  async findById(id: string): Promise<Shipment | null> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM shipments WHERE id = ?',
      [id]
    );

    const shipment = (rows as any[])[0];
    return shipment ? this.mapToShipment(shipment) : null;
  }

  async findByUserId(userId: string): Promise<Shipment[]> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM shipments WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return (rows as any[]).map(this.mapToShipment);
  }

  async findByStatus(status: ShipmentStatus): Promise<Shipment[]> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM shipments WHERE status = ? ORDER BY created_at DESC',
      [status]
    );

    return (rows as any[]).map(this.mapToShipment);
  }

  async findByCarrierId(carrierId: string): Promise<Shipment[]> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM shipments WHERE carrier_id = ? ORDER BY created_at DESC',
      [carrierId]
    );

    return (rows as any[]).map(this.mapToShipment);
  }

  async create(shipment: Shipment): Promise<Shipment> {
    const [result] = await this.pool.execute(
      `INSERT INTO shipments (
        id, user_id, package_details, destination_address,
        status, carrier_id, route_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        shipment.id,
        shipment.userId,
        JSON.stringify(shipment.packageDetails),
        JSON.stringify(shipment.destinationAddress),
        shipment.status,
        shipment.carrierId,
        shipment.routeId,
        shipment.createdAt,
        shipment.updatedAt
      ]
    );

    return shipment;
  }

  async update(shipment: Shipment): Promise<Shipment> {
    await this.pool.execute(
      `UPDATE shipments SET
        package_details = ?,
        destination_address = ?,
        status = ?,
        carrier_id = ?,
        route_id = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        JSON.stringify(shipment.packageDetails),
        JSON.stringify(shipment.destinationAddress),
        shipment.status,
        shipment.carrierId,
        shipment.routeId,
        shipment.updatedAt,
        shipment.id
      ]
    );

    return shipment;
  }

  async delete(id: string): Promise<void> {
    await this.pool.execute('DELETE FROM shipments WHERE id = ?', [id]);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Shipment[]> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM shipments WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC',
      [startDate, endDate]
    );

    return (rows as any[]).map(this.mapToShipment);
  }

  async countByStatus(status: ShipmentStatus): Promise<number> {
    const [rows] = await this.pool.execute(
      'SELECT COUNT(*) as count FROM shipments WHERE status = ?',
      [status]
    );

    return (rows as any[])[0].count;
  }

  async findActiveShipmentsByCarrier(carrierId: string): Promise<Shipment[]> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM shipments WHERE carrier_id = ? AND status = ? ORDER BY created_at DESC',
      [carrierId, ShipmentStatus.IN_TRANSIT]
    );

    return (rows as any[]).map(this.mapToShipment);
  }
} 