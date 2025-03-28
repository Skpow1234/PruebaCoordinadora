import mysql from 'mysql2/promise';
import { Tracking, Location, TrackingEvent } from '../../domain/entities/tracking.entity';
import { TrackingRepository } from '../../domain/repositories/tracking.repository';

export class MySQLTrackingRepository implements TrackingRepository {
  constructor(private readonly pool: mysql.Pool) {}

  private mapToTracking(row: any): Tracking {
    return new Tracking(
      row.id,
      row.shipment_id,
      JSON.parse(row.current_location) as Location,
      row.status,
      JSON.parse(row.events) as TrackingEvent[],
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  async findById(id: string): Promise<Tracking | null> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM trackings WHERE id = ?',
      [id]
    );

    const tracking = (rows as any[])[0];
    return tracking ? this.mapToTracking(tracking) : null;
  }

  async findByShipmentId(shipmentId: string): Promise<Tracking | null> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM trackings WHERE shipment_id = ?',
      [shipmentId]
    );

    const tracking = (rows as any[])[0];
    return tracking ? this.mapToTracking(tracking) : null;
  }

  async create(tracking: Tracking): Promise<Tracking> {
    const [result] = await this.pool.execute(
      `INSERT INTO trackings (
        id, shipment_id, current_location, status,
        events, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tracking.id,
        tracking.shipmentId,
        JSON.stringify(tracking.currentLocation),
        tracking.status,
        JSON.stringify(tracking.events),
        tracking.createdAt,
        tracking.updatedAt
      ]
    );

    return tracking;
  }

  async update(tracking: Tracking): Promise<Tracking> {
    await this.pool.execute(
      `UPDATE trackings SET
        current_location = ?,
        status = ?,
        events = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        JSON.stringify(tracking.currentLocation),
        tracking.status,
        JSON.stringify(tracking.events),
        tracking.updatedAt,
        tracking.id
      ]
    );

    return tracking;
  }

  async delete(id: string): Promise<void> {
    await this.pool.execute('DELETE FROM trackings WHERE id = ?', [id]);
  }

  async findActiveTrackings(): Promise<Tracking[]> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM trackings WHERE status != ? ORDER BY updated_at DESC',
      ['delivered']
    );

    return (rows as any[]).map(this.mapToTracking);
  }

  async findTrackingsByDateRange(startDate: Date, endDate: Date): Promise<Tracking[]> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM trackings WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC',
      [startDate, endDate]
    );

    return (rows as any[]).map(this.mapToTracking);
  }

  async findTrackingsByStatus(status: string): Promise<Tracking[]> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM trackings WHERE status = ? ORDER BY updated_at DESC',
      [status]
    );

    return (rows as any[]).map(this.mapToTracking);
  }
} 