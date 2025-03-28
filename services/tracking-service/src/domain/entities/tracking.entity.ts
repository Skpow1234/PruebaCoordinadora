export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: string;
  location: Location;
  timestamp: Date;
  description?: string;
}

export class Tracking {
  constructor(
    public readonly id: string,
    public readonly shipmentId: string,
    public readonly currentLocation: Location,
    public readonly status: string,
    public readonly events: TrackingEvent[],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(shipmentId: string, location: Location, status: string): Tracking {
    const event: TrackingEvent = {
      id: crypto.randomUUID(),
      shipmentId,
      status,
      location,
      timestamp: new Date()
    };

    return new Tracking(
      crypto.randomUUID(),
      shipmentId,
      location,
      status,
      [event]
    );
  }

  public updateLocation(location: Location, status: string, description?: string): Tracking {
    const event: TrackingEvent = {
      id: crypto.randomUUID(),
      shipmentId: this.shipmentId,
      status,
      location,
      timestamp: new Date(),
      description
    };

    return new Tracking(
      this.id,
      this.shipmentId,
      location,
      status,
      [...this.events, event],
      this.createdAt,
      new Date()
    );
  }
} 