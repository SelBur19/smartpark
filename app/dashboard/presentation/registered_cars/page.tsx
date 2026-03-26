"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Car, Search, CircleCheck, CircleOff } from "lucide-react";

interface CarEntry {
  plate_Number: string;
  isActive: number;
}

interface SortConfig {
  key: keyof CarEntry | null;
  direction: "asc" | "desc";
}

export default function AdminCarsPage() {
  const [cars, setCars] = useState<CarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCars = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) { router.push("/login"); return; }

      const parsedUser = JSON.parse(storedUser);
      const token = parsedUser?.token;
      if (!token) { router.push("/login"); return; }

      try {
        const formData = new URLSearchParams();
        formData.append("token", token);

        const response = await fetch("https://smartpark.htl-projekt.com/api_getCarsA.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        });

        const rawText = await response.text();

        let data;
        try {
          data = JSON.parse(rawText);
        } catch {
          console.error("Non-JSON response from server:", rawText);
          setError("Server returned an unexpected response. Check the console for details.");
          return;
        }

        if (data.status === "success") {
          setCars(data.data);
        } else {
          setError(data.message || "Unknown error from server.");
        }
      } catch (err) {
        setError(`Failed to load cars: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [router]);

  const getFilteredAndSorted = () => {
    let filtered = [...cars];

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((car) =>
        car.plate_Number.toLowerCase().includes(lower)
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof CarEntry];
        const bVal = b[sortConfig.key as keyof CarEntry];

        if (typeof aVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal as string)
            : (bVal as string).localeCompare(aVal);
        }
        if (typeof aVal === "number") {
          return sortConfig.direction === "asc"
            ? aVal - (bVal as number)
            : (bVal as number) - aVal;
        }
        return 0;
      });
    }

    return filtered;
  };

  const handleSort = (key: keyof CarEntry) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const filteredCars = getFilteredAndSorted();

  const stats = {
    total: cars.length,
    active: cars.filter((c) => c.isActive === 1).length,
    inactive: cars.filter((c) => c.isActive === 0).length,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto py-8 px-4 md:py-24">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">
              Registered Cars
            </h1>
            <p className="text-gray-600">Admin panel — all registered vehicles and their parking status</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        {/* Stats Cards */}
        {!loading && !error && cars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 border border-yellow-500/20 bg-gradient-to-br from-yellow-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Vehicles</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.total}</p>
                </div>
                <Car className="w-10 h-10 text-yellow-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border border-green-500/20 bg-gradient-to-br from-green-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Currently Parked</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CircleCheck className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border border-gray-300/40 bg-gradient-to-br from-gray-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Not Parked</p>
                  <p className="text-3xl font-bold text-gray-500">{stats.inactive}</p>
                </div>
                <CircleOff className="w-10 h-10 text-gray-400 opacity-20" />
              </div>
            </Card>
          </div>
        )}

        {/* Main Table Card */}
        <Card className="p-6">

          {/* Search */}
          {!loading && !error && cars.length > 0 && (
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by plate number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading vehicles...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && cars.length === 0 && (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No vehicles found.</p>
              <p className="text-gray-500 text-sm mt-2">Registered cars will appear here.</p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && cars.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {filteredCars.length} of {cars.length} vehicles
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="text-left py-4 px-3 font-semibold text-gray-700 w-12">#</th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort("plate_Number")}
                          className="flex items-center gap-2 hover:text-gray-900"
                        >
                          Plate Number
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort("isActive")}
                          className="flex items-center gap-2 hover:text-gray-900"
                        >
                          Status
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCars.map((car, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-yellow-500/5 transition-colors duration-150"
                      >
                        <td className="py-4 px-3 text-gray-400 text-sm">{index + 1}</td>
                        <td className="py-4 px-3 font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-gray-400" />
                            {car.plate_Number}
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          {car.isActive === 1 ? (
                            <Badge className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-100">
                              <CircleCheck className="w-3 h-3 mr-1" />
                              Parked
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500">
                              <CircleOff className="w-3 h-3 mr-1" />
                              Not Parked
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCars.length === 0 && searchTerm && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No vehicles match your search.</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
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