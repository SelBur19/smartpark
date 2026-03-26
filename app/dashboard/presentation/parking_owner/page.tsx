"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, MapPin, Car, ParkingCircle, Plus, X, Lock, Unlock, Users, Trash2 } from "lucide-react";

interface AcceptedCar {
  plate_Number: string;
}

interface ParkingPlace {
  name: string;
  address: string;
  max_Spots: number;
  occupied: number;
  freeSpots: number;
  restricted: boolean | number;
  id?: number;
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", address: "", cap: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Accepted cars modal state
  const [acceptedModal, setAcceptedModal] = useState<{ place: ParkingPlace } | null>(null);
  const [acceptedCars, setAcceptedCars] = useState<AcceptedCar[]>([]);
  const [acceptedLoading, setAcceptedLoading] = useState(false);
  const [acceptedError, setAcceptedError] = useState<string | null>(null);
  const [newPlate, setNewPlate] = useState("");
  const [addCarLoading, setAddCarLoading] = useState(false);
  const [addCarError, setAddCarError] = useState<string | null>(null);
  const [deletingPlate, setDeletingPlate] = useState<string | null>(null);

  const router = useRouter();

  const getToken = (): string | null => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    return JSON.parse(storedUser)?.token ?? null;
  };

  const fetchParkingPlaces = async () => {
    const token = getToken();
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
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Failed to fetch parking places", response.status, text);
        setError(`Failed to load parking places: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();

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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser?.token) {
      router.push("/login");
      return;
    }
    fetchParkingPlaces();
  }, [router]);

  const handleAddParkPlace = async () => {
    const token = getToken();
    if (!token) return;

    if (!addForm.name.trim() || !addForm.address.trim() || !addForm.cap.trim()) {
      setAddError("All fields are required.");
      return;
    }

    setAddLoading(true);
    setAddError(null);

    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("name", addForm.name.trim());
      formData.append("address", addForm.address.trim());
      formData.append("cap", addForm.cap.trim());

      const response = await fetch(
        "https://smartpark.htl-projekt.com/api_addParkPlace.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setShowAddModal(false);
        setAddForm({ name: "", address: "", cap: "" });
        setLoading(true);
        await fetchParkingPlaces();
      } else {
        setAddError(data.message ?? "Failed to add parking place.");
      }
    } catch (err) {
      setAddError(`Error: ${(err as Error).message}`);
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggleRestricted = async (place: ParkingPlace) => {
    if (place.id === undefined) return;
    const token = getToken();
    if (!token) return;

    setTogglingId(place.id);

    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("parkPlaceID", String(place.id));

      const response = await fetch(
        "https://smartpark.htl-projekt.com/api_changeRestrictedStatus.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setParkingPlaces((prev) =>
          prev.map((p) =>
            p.id === place.id ? { ...p, restricted: !p.restricted } : p
          )
        );
      } else {
        console.error("Toggle restricted failed:", data.message);
      }
    } catch (err) {
      console.error("Toggle restricted error:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const openAcceptedModal = async (place: ParkingPlace) => {
    setAcceptedModal({ place });
    setAcceptedCars([]);
    setAcceptedError(null);
    setNewPlate("");
    setAddCarError(null);
    setAcceptedLoading(true);

    const token = getToken();
    if (!token || place.id === undefined) return;

    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("ppid", String(place.id));

      const response = await fetch(
        "https://smartpark.htl-projekt.com/api_getRestrictedCars.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        setAcceptedCars(data.data);
      } else {
        setAcceptedError(data.message ?? "Failed to load accepted cars.");
      }
    } catch (err) {
      setAcceptedError(`Error: ${(err as Error).message}`);
    } finally {
      setAcceptedLoading(false);
    }
  };

  const handleAddAcceptedCar = async () => {
    if (!acceptedModal || acceptedModal.place.id === undefined) return;
    const token = getToken();
    if (!token) return;

    if (!newPlate.trim()) {
      setAddCarError("Plate number is required.");
      return;
    }

    setAddCarLoading(true);
    setAddCarError(null);

    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("plateNumber", newPlate.trim().toUpperCase());
      formData.append("parkPlaceID", String(acceptedModal.place.id));

      const response = await fetch(
        "https://smartpark.htl-projekt.com/api_addAcceptedCar.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        setAcceptedCars((prev) => [...prev, { plate_Number: newPlate.trim().toUpperCase() }]);
        setNewPlate("");
      } else {
        setAddCarError(data.message ?? "Failed to add car.");
      }
    } catch (err) {
      setAddCarError(`Error: ${(err as Error).message}`);
    } finally {
      setAddCarLoading(false);
    }
  };

  const handleDeleteAcceptedCar = async (plateNumber: string) => {
    if (!acceptedModal || acceptedModal.place.id === undefined) return;
    const token = getToken();
    if (!token) return;

    setDeletingPlate(plateNumber);

    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("plateNumber", plateNumber);
      formData.append("parkPlaceID", String(acceptedModal.place.id));

      const response = await fetch(
        "https://smartpark.htl-projekt.com/api_deleteAcceptedCar.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        setAcceptedCars((prev) => prev.filter((c) => c.plate_Number !== plateNumber));
      } else {
        console.error("Delete failed:", data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingPlate(null);
    }
  };

  const getSortedParkingPlaces = () => {
    let sorted = [...parkingPlaces];

    if (sortConfig.key) {
      sorted.sort((a, b) => {
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

    return sorted;
  };

  const handleSort = (key: keyof ParkingPlace) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedParkingPlaces = getSortedParkingPlaces();

  const stats = {
    totalPlaces: parkingPlaces.length,
    occupiedSpots: parkingPlaces.reduce((sum, place) => sum + place.occupied, 0),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto py-8 px-4 md:py-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">
              Parking Places Overview
            </h1>
            <p className="text-gray-600">Manage and monitor your parking place occupancy</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => { setShowAddModal(true); setAddError(null); }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Parking Place
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </div>

        {/* Statistics Cards — only Total Places and Occupied */}
        {!loading && !error && parkingPlaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="p-6 border border-yellow-500/20 bg-gradient-to-br from-yellow-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Parking Places</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.totalPlaces}</p>
                </div>
                <ParkingCircle className="w-10 h-10 text-yellow-500 opacity-20" />
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
              <p className="text-gray-500 text-sm mt-2">
                Add your first parking place using the button above.
              </p>
            </div>
          )}

          {!loading && !error && parkingPlaces.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {sortedParkingPlaces.length} parking place{sortedParkingPlaces.length !== 1 ? "s" : ""}
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
                          Name <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort("address")}
                          className="flex items-center gap-2 hover:text-gray-900"
                        >
                          Address <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort("max_Spots")}
                          className="flex items-center gap-2 hover:text-gray-900"
                        >
                          Total Spots <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort("occupied")}
                          className="flex items-center gap-2 hover:text-gray-900"
                        >
                          Occupied <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort("freeSpots")}
                          className="flex items-center gap-2 hover:text-gray-900"
                        >
                          Available <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">
                        Restricted
                      </th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">
                        Accepted Cars
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedParkingPlaces.map((place, index) => {
                      const isRestricted = Boolean(place.restricted);
                      const isToggling = togglingId === place.id;

                      return (
                        <tr
                          key={index}
                          className="border-b hover:bg-yellow-500/5 transition-colors duration-150"
                        >
                          <td className="py-4 px-3 font-medium text-gray-900">{place.name}</td>
                          <td className="py-4 px-3 text-gray-700">
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                              {place.address}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-gray-700">
                            <Badge variant="outline">{place.max_Spots}</Badge>
                          </td>
                          <td className="py-4 px-3 text-red-600 font-semibold">{place.occupied}</td>
                          <td className="py-4 px-3 text-green-600 font-semibold">{place.freeSpots}</td>
                          <td className="py-4 px-3">
                            <button
                              onClick={() => handleToggleRestricted(place)}
                              disabled={isToggling || place.id === undefined}
                              title={isRestricted ? "Click to unrestrict" : "Click to restrict"}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
                                ${isRestricted
                                  ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                                  : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                                }
                                ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                              `}
                            >
                              {isToggling ? (
                                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : isRestricted ? (
                                <Lock className="w-3 h-3" />
                              ) : (
                                <Unlock className="w-3 h-3" />
                              )}
                              {isRestricted ? "Restricted" : "Open"}
                            </button>
                          </td>
                          <td className="py-4 px-3">
                            <button
                              onClick={() => openAcceptedModal(place)}
                              disabled={place.id === undefined}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Users className="w-3 h-3" />
                              Show Accepted Cars
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </main>

      <Footer />

      {/* Add Parking Place Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => { setShowAddModal(false); setAddForm({ name: "", address: "", cap: "" }); setAddError(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">Add Parking Place</h2>
            <p className="text-sm text-gray-500 mb-6">Fill in the details for your new parking place.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Central Parking"
                  value={addForm.name}
                  onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Input
                  type="text"
                  placeholder="e.g. Main Street 12, Vienna"
                  value={addForm.address}
                  onChange={(e) => setAddForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Spots)</label>
                <Input
                  type="number"
                  placeholder="e.g. 50"
                  min={1}
                  value={addForm.cap}
                  onChange={(e) => setAddForm((f) => ({ ...f, cap: e.target.value }))}
                />
              </div>

              {addError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                  {addError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowAddModal(false); setAddForm({ name: "", address: "", cap: "" }); setAddError(null); }}
                  disabled={addLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={handleAddParkPlace}
                  disabled={addLoading}
                >
                  {addLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    "Add Parking Place"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Accepted Cars Modal */}
      {acceptedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[80vh]">
            <button
              onClick={() => setAcceptedModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">Accepted Cars</h2>
            <p className="text-sm text-gray-500 mb-4">
              {acceptedModal.place.name} — {acceptedModal.place.address}
            </p>

            {/* Add car input */}
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder="Plate number (e.g. W-12345A)"
                value={newPlate}
                onChange={(e) => { setNewPlate(e.target.value.toUpperCase()); setAddCarError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddAcceptedCar(); }}
                className="flex-1"
              />
              <Button
                onClick={handleAddAcceptedCar}
                disabled={addCarLoading}
                className="bg-yellow-500 hover:bg-yellow-600 text-white shrink-0"
              >
                {addCarLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </Button>
            </div>

            {addCarError && (
              <div className="mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
                {addCarError}
              </div>
            )}

            {/* Car list */}
            <div className="overflow-y-auto flex-1">
              {acceptedLoading && (
                <div className="flex justify-center items-center py-8">
                  <span className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
                </div>
              )}

              {acceptedError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
                  {acceptedError}
                </div>
              )}

              {!acceptedLoading && !acceptedError && acceptedCars.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No accepted cars yet. Add one above.
                </div>
              )}

              {!acceptedLoading && !acceptedError && acceptedCars.length > 0 && (
                <ul className="space-y-2">
                  {acceptedCars.map((car) => (
                    <li
                      key={car.plate_Number}
                      className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <span className="font-mono font-semibold text-gray-800 tracking-wider text-sm">
                        {car.plate_Number}
                      </span>
                      <button
                        onClick={() => handleDeleteAcceptedCar(car.plate_Number)}
                        disabled={deletingPlate === car.plate_Number}
                        className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Remove car"
                      >
                        {deletingPlate === car.plate_Number ? (
                          <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-4 border-t mt-4">
              <Button variant="outline" className="w-full" onClick={() => setAcceptedModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
