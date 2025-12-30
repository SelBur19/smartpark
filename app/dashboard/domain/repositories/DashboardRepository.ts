import { ParkingSpot } from "../entities/ParkingSpot";
import { Booking } from "../entities/Booking";

export interface DashboardRepository {
  fetchDashboardData(): Promise<{ parkingSpots: ParkingSpot[]; bookings: Booking[] }>;
}
