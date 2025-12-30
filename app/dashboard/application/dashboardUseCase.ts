import { ParkingSpot } from "../domain/entities/ParkingSpot";
import { Booking } from "../domain/entities/Booking";
import { DashboardRepository } from "../domain/repositories/DashboardRepository";

export const getDashboardData = async (
  repository: DashboardRepository
): Promise<{ parkingSpots: ParkingSpot[]; bookings: Booking[] }> => {
  return repository.fetchDashboardData();
};
