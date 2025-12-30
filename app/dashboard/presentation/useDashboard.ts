import { useState, useEffect } from "react";
import { getDashboardData } from "@/dashboard/application/dashboardUseCase";
import { DashboardApiRepository } from "@/dashboard/infrastructure/DashboardApiRepository";
import { ParkingSpot } from "@/dashboard/domain/entities/ParkingSpot";
import { Booking } from "@/dashboard/domain/entities/Booking";

export const useDashboard = () => {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const repository = new DashboardApiRepository();

    const fetchData = async () => {
      setLoading(true);
      const data = await getDashboardData(repository);
      setParkingSpots(data.parkingSpots);
      setBookings(data.bookings);
      setLoading(false);
    };

    fetchData();
  }, []);

  return { parkingSpots, bookings, loading };
};
