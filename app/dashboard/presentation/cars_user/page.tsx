"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";

interface CarData {
  plate_Number: string;
  isActive: boolean;
}

export default function CarsUserPage() {
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCars = async () => {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const token = parsedUser?.token;

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const formData = new URLSearchParams();
        formData.append("token", token);

        const response = await fetch(
          "https://smartpark.htl-projekt.com/api_getCarsU.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
          }
        );

        if (!response.ok) {
          const text = await response.text();
          console.error("Failed to fetch cars", response.status, response.statusText, text);
          setError(`Failed to load cars: ${response.status} ${response.statusText}`);
          return;
        }

        const data = await response.json();

        if (data.status === "success") {
          setCars(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(`Failed to load cars: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [router]);

  const stats = {
    totalCars: cars.length,
    activeCars: cars.filter((car) => car.isActive).length,
    inactiveCars: cars.filter((car) => !car.isActive).length,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto py-24">

        {/* ✅ HEADER EXACTLY LIKE PARKPLACES */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-yellow-500">
              My Cars
            </h1>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </Card>

        {/* Statistics Cards */}
        {!loading && !error && cars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 border border-yellow-500/20 bg-gradient-to-br from-yellow-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Cars</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.totalCars}</p>
                </div>
                <Car className="w-10 h-10 text-yellow-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border border-green-500/20 bg-gradient-to-br from-green-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active (In Use)</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeCars}</p>
                </div>
                <Car className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border border-blue-500/20 bg-gradient-to-br from-blue-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Inactive</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.inactiveCars}</p>
                </div>
                <Car className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Card className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading cars...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && cars.length === 0 && (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No cars registered yet.</p>
              <p className="text-gray-500 text-sm mt-2">Add your first car to get started.</p>
            </div>
          )}

          {!loading && !error && cars.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-6">
                You have {cars.length} registered car{cars.length !== 1 ? "s" : ""}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cars.map((car, index) => (
                  <Card
                    key={index}
                    className="relative overflow-hidden border-2 transition-all hover:shadow-lg"
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        car.isActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-yellow-100 rounded-lg">
                            <Car className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">License Plate</p>
                            <p className="text-2xl font-bold text-gray-900 font-mono tracking-wider">
                              {car.plate_Number}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <Badge
                          className={`${
                            car.isActive
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-gray-500 hover:bg-gray-600"
                          }`}
                        >
                          {car.isActive ? "Active Session" : "Idle"}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-6">
                        {car.isActive
                          ? "Currently in use with an active parking session"
                          : "No active parking session"}
                      </p>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" size="sm">
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}