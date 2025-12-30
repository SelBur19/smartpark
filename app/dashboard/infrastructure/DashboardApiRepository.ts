import { DashboardRepository } from "../domain/repositories/DashboardRepository";
import { ParkingSpot } from "../domain/entities/ParkingSpot";
import { Booking } from "../domain/entities/Booking";

// Mock implementation, replace with real API later
export class DashboardApiRepository implements DashboardRepository {
  async fetchDashboardData(): Promise<{ parkingSpots: ParkingSpot[]; bookings: Booking[] }> {
    const parkingSpots: ParkingSpot[] = [
      new ParkingSpot(1, "Downtown Mall", 15, 50, "$2/hr"),
      new ParkingSpot(2, "City Center", 8, 30, "$3/hr"),
      new ParkingSpot(3, "Airport Terminal", 22, 100, "$5/hr"),
    ];

    const bookings: Booking[] = [
      new Booking(1, "Downtown Mall", "2024-01-15", "14:30", "Active"),
      new Booking(2, "City Center", "2024-01-10", "09:15", "Completed"),
      new Booking(3, "Airport Terminal", "2024-01-08", "16:45", "Completed"),
    ];

    return { parkingSpots, bookings };
  }
}
