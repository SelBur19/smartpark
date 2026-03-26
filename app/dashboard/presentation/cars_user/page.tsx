"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Car, CircleCheck, CircleOff, Plus, Trash2, X } from "lucide-react";

interface CarEntry {
  plate_Number: string;
  isActive: number;
}

interface SortConfig {
  key: keyof CarEntry | null;
  direction: "asc" | "desc";
}

export default function UserCarsPage() {
  const [cars, setCars] = useState<CarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });

  const [showModal, setShowModal] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const router = useRouter();

  const getToken = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    const parsedUser = JSON.parse(storedUser);
    return parsedUser?.token ?? null;
  };

  const fetchCars = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    try {
      const formData = new URLSearchParams();
      formData.append("token", token);

      const response = await fetch("https://smartpark.htl-projekt.com/api_getCarsU.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        setError("Server returned an unexpected response.");
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) { router.push("/login"); return; }
    fetchCars();
  }, [router]);

  const handleAddCar = async () => {
    if (!plateNumber.trim()) {
      setAddError("Please enter a plate number.");
      return;
    }

    setAddLoading(true);
    setAddError(null);
    setAddSuccess(null);

    const token = getToken();
    if (!token) { router.push("/login"); return; }

    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("plateNumber", plateNumber.trim());

      const response = await fetch("https://smartpark.htl-projekt.com/api_addUserToCar.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        setAddError("Server returned an unexpected response.");
        return;
      }

      if (data.status === "success") {
        setAddSuccess("Car added successfully!");
        setPlateNumber("");
        await fetchCars();
        setTimeout(() => {
          setShowModal(false);
          setAddSuccess(null);
        }, 1200);
      } else {
        setAddError(data.message || "Failed to add car.");
      }
    } catch (err) {
      setAddError(`Error: ${(err as Error).message}`);
    } finally {
      setAddLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPlateNumber("");
    setAddError(null);
    setAddSuccess(null);
  };

  const openDeleteModal = (plate: string) => {
    setDeleteTarget(plate);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const handleDeleteCar = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    setDeleteError(null);

    const token = getToken();
    if (!token) { router.push("/login"); return; }

    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("plateNumber", deleteTarget);

      const response = await fetch("https://smartpark.htl-projekt.com/api_deleteCar.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        setDeleteError("Server returned an unexpected response.");
        return;
      }

      if (data.status === "success") {
        await fetchCars();
        handleCloseDeleteModal();
      } else {
        setDeleteError(data.message || "Failed to delete car.");
      }
    } catch (err) {
      setDeleteError(`Error: ${(err as Error).message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getSorted = () => {
    const sorted = [...cars];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
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
    return sorted;
  };

  const handleSort = (key: keyof CarEntry) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedCars = getSorted();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto py-8 px-4 md:py-24">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">
              My Cars
            </h1>
            <p className="text-gray-600">View and manage your registered vehicles</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowModal(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Car
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </div>

        {/* Table Card */}
        <Card className="p-6">

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading vehicles...</p>
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
              <p className="text-gray-600 text-lg">No vehicles found.</p>
              <p className="text-gray-500 text-sm mt-2">Add your first car using the button above.</p>
            </div>
          )}

          {!loading && !error && cars.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {sortedCars.length} of {cars.length} vehicles
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
                          Plate Number <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort("isActive")}
                          className="flex items-center gap-2 hover:text-gray-900"
                        >
                          Status <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-right py-4 px-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCars.map((car, index) => (
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
                        <td className="py-4 px-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(car.plate_Number)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </main>

      <Footer />

      {/* Add Car Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add a Car</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
              <Input
                type="text"
                placeholder="e.g. AA123BB"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleAddCar()}
                className="uppercase"
              />
            </div>

            {addError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{addError}</p>
              </div>
            )}

            {addSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-600 text-sm">{addSuccess}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleCloseModal} disabled={addLoading}>Cancel</Button>
              <Button onClick={handleAddCar} disabled={addLoading} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                {addLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Car
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Remove Car</h2>
              <button onClick={handleCloseDeleteModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg mb-4">
              <Trash2 className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">
                Are you sure you want to remove <span className="font-semibold">{deleteTarget}</span>? This will also delete all related sessions and logs.
              </p>
            </div>

            {deleteError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{deleteError}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleCloseDeleteModal} disabled={deleteLoading}>Cancel</Button>
              <Button
                onClick={handleDeleteCar}
                disabled={deleteLoading}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {deleteLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Removing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Remove
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}