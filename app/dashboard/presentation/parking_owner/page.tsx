"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, MapPin, Car, ParkingCircle, Users } from "lucide-react";

interface ParkingPlace {
  name: string;
  address: string;
  max_Spots: number;
  occupied: number;
  freeSpots: number;
}

interface SortConfig {
  key: keyof ParkingPlace | null;
  direction: "asc" | "desc";
}

export default function ParkingOwnerPage() {
  const [parkingPlaces, setParkingPlaces] = useState<ParkingPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  const router = useRouter();

  useEffect(() => {
    const fetchParkingPlaces = async () => {
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
          "https://smartpark.htl-projekt.com/api_getParkPlacesO.php",
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
          console.error(
            "Failed to fetch parking places",
            response.status,
            response.statusText,
            text
          );
          setError(`Failed to load parking places: ${response.status} ${response.statusText}`);
          return;
        }

        const data = await response.json();
        console.log("PARKING PLACES RESPONSE:", response.url, response.status, data);

        if (data.status === "success") {
          setParkingPlaces(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        console.error("Fetch parking places error:", err);
        setError(`Failed to load parking places: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingPlaces();
  }, [router]);


  const getFilteredAndSortedParkingPlaces = () => {
    let filtered = [...parkingPlaces];

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof ParkingPlace];
        const bValue = b[sortConfig.key as keyof ParkingPlace];

        if (typeof aValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue);
        }

        if (typeof aValue === "number") {
          return sortConfig.direction === "asc"
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
        }

        return 0;
      });
    }

    return filtered;
  };

  const handleSort = (key: keyof ParkingPlace) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredParkingPlaces = getFilteredAndSortedParkingPlaces();

  const stats = {
    totalPlaces: parkingPlaces.length,
    totalSpots: parkingPlaces.reduce((sum, place) => sum + place.max_Spots, 0),
    occupiedSpots: parkingPlaces.reduce((sum, place) => sum + place.occupied, 0),
    freeSpots: parkingPlaces.reduce((sum, place) => sum + place.freeSpots, 0),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

    
      <main className="flex-1 container mx-auto py-24">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-yellow-500">All Parkplaces</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </Card>


        {/* Statistics Cards */}
        {!loading && !error && parkingPlaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 border border-yellow-500/20 bg-gradient-to-br from-yellow-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Parking Places</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.totalPlaces}</p>
                </div>
                <ParkingCircle className="w-10 h-10 text-yellow-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border border-green-500/20 bg-gradient-to-br from-green-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Spots</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalSpots}</p>
                </div>
                <Users className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border border-blue-500/20 bg-gradient-to-br from-blue-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Currently Occupied</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.occupiedSpots}</p>
                </div>
                <Car className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border border-purple-500/20 bg-gradient-to-br from-purple-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Available Spots</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.freeSpots}</p>
                </div>
                <MapPin className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </Card>

          </div>
        )}

        {/* Main Content Card */}
        <Card className="p-6">

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading parking places...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && parkingPlaces.length === 0 && (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No parking places found.</p>
              <p className="text-gray-500 text-sm mt-2">Your parking places will appear here after successful API response.</p>
            </div>
          )}

          {!loading && !error && parkingPlaces.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {filteredParkingPlaces.length} of {parkingPlaces.length} parking places
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort("name")}
                          className="flex items-center gap-2 hover:text-gray-900"
                        >
                          Name
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort("address")}
                          className="flex items-center gap-2 hover:text-gray-900"
                        >
                          Address
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort("max_Spots")}
                          className="flex items-center gap-2 hover:text-gray-900"
                        >
                          Total Spots
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort("occupied")}
                          className="flex items-center gap-2 hover:text-gray-900"
                        >
                          Occupied
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort("freeSpots")}
                          className="flex items-center gap-2 hover:text-gray-900"
                        >
                          Available
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParkingPlaces.map((place, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-yellow-500/5 transition-colors duration-150"
                      >
                        <td className="py-4 px-3 font-medium text-gray-900">{place.name}</td>
                        <td className="py-4 px-3 text-gray-700 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {place.address}
                        </td>
                        <td className="py-4 px-3 text-gray-700">
                          <Badge variant="outline">{place.max_Spots}</Badge>
                        </td>
                        <td className="py-4 px-3 text-red-600 font-semibold">
                          {place.occupied}
                        </td>
                        <td className="py-4 px-3 text-green-600 font-semibold">
                          {place.freeSpots}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredParkingPlaces.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No parking places available.</p>
                </div>
              )}
            </>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}