"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, MapPin, Car, ParkingCircle, Plus, X, Lock, Unlock, Users, Trash2, CreditCard, CheckCircle2, ShieldCheck, Tag } from "lucide-react";

interface AcceptedCar {
  plate_Number: string;
}

interface SubscriptionStatus {
  isAdmin: number;
  subscribed: number;
  daysLeft: number;
  endDate: string | null;
}

interface PricingData {
  ppID: number;
  pModel: string;
  hourly: number | null;
  daily: number | null;
  freeMin: number;
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

  const [acceptedModal, setAcceptedModal] = useState<{ place: ParkingPlace } | null>(null);
  const [acceptedCars, setAcceptedCars] = useState<AcceptedCar[]>([]);
  const [acceptedLoading, setAcceptedLoading] = useState(false);
  const [acceptedError, setAcceptedError] = useState<string | null>(null);
  const [newPlate, setNewPlate] = useState("");
  const [addCarLoading, setAddCarLoading] = useState(false);
  const [addCarError, setAddCarError] = useState<string | null>(null);
  const [deletingPlate, setDeletingPlate] = useState<string | null>(null);

  const [subModal, setSubModal] = useState<{ place: ParkingPlace } | null>(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [subStatusLoading, setSubStatusLoading] = useState(false);
  const [subDays, setSubDays] = useState("30");
  const [subPrice, setSubPrice] = useState<{ pricePerDay: number; totalPrice: number } | null>(null);
  const [subPriceLoading, setSubPriceLoading] = useState(false);
  const [subAddLoading, setSubAddLoading] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const [subSuccess, setSubSuccess] = useState<string | null>(null);

  const [pricingModal, setPricingModal] = useState<{ place: ParkingPlace } | null>(null);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pricingSuccess, setPricingSuccess] = useState<string | null>(null);
  const [pricingSaveLoading, setPricingSaveLoading] = useState(false);
  const [pricingForm, setPricingForm] = useState({
    pModel: "hourly",
    hourly: "",
    daily: "",
    freeMin: "",
  });

  const router = useRouter();

  const getToken = (): string | null => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    return JSON.parse(storedUser)?.token ?? null;
  };

  const fetchParkingPlaces = async () => {
    const token = getToken();
    if (!token) { router.push("/login"); return; }

    try {
      const formData = new URLSearchParams();
      formData.append("token", token);

      const response = await fetch("https://smartpark.htl-projekt.com/api_getParkPlacesO.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!response.ok) {
        setError(`Failed to load parking places: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      if (data.status === "success") setParkingPlaces(data.data);
      else setError(data.message);
    } catch (err) {
      setError(`Failed to load parking places: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) { router.push("/login"); return; }
    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser?.token) { router.push("/login"); return; }
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
      const response = await fetch("https://smartpark.htl-projekt.com/api_addParkPlace.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
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
      const response = await fetch("https://smartpark.htl-projekt.com/api_changeRestrictedStatus.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      const data = await response.json();
      if (data.status === "success") {
        setParkingPlaces((prev) =>
          prev.map((p) => p.id === place.id ? { ...p, restricted: !p.restricted } : p)
        );
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
      const response = await fetch("https://smartpark.htl-projekt.com/api_getRestrictedCars.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      const data = await response.json();
      if (data.status === "success") setAcceptedCars(data.data);
      else setAcceptedError(data.message ?? "Failed to load accepted cars.");
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
    if (!newPlate.trim()) { setAddCarError("Plate number is required."); return; }
    setAddCarLoading(true);
    setAddCarError(null);
    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("plateNumber", newPlate.trim().toUpperCase());
      formData.append("parkPlaceID", String(acceptedModal.place.id));
      const response = await fetch("https://smartpark.htl-projekt.com/api_addAcceptedCar.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
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
      const response = await fetch("https://smartpark.htl-projekt.com/api_deleteAcceptedCar.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      const data = await response.json();
      if (data.status === "success") {
        setAcceptedCars((prev) => prev.filter((c) => c.plate_Number !== plateNumber));
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingPlate(null);
    }
  };

  const openSubModal = async (place: ParkingPlace) => {
    setSubModal({ place });
    setSubStatus(null);
    setSubPrice(null);
    setSubDays("30");
    setSubError(null);
    setSubSuccess(null);
    setSubStatusLoading(true);
    const token = getToken();
    if (!token || place.id === undefined) return;
    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("parkPlaceID", String(place.id));
      const response = await fetch("https://smartpark.htl-projekt.com/api_getSubscriptionStatus.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      const data = await response.json();
      if (data.status === "success") {
        setSubStatus(data);
        if (!data.isAdmin) fetchSubPrice(30);
      } else {
        setSubError(data.message ?? "Failed to load subscription status.");
      }
    } catch (err) {
      setSubError(`Error: ${(err as Error).message}`);
    } finally {
      setSubStatusLoading(false);
    }
  };

  const fetchSubPrice = async (days: number) => {
    const token = getToken();
    if (!token || days <= 0) return;
    setSubPriceLoading(true);
    setSubPrice(null);
    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("days", String(days));
      const response = await fetch("https://smartpark.htl-projekt.com/api_getSubscriptionPrice.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      const data = await response.json();
      if (data.status === "success") {
        setSubPrice({ pricePerDay: data.pricePerDay, totalPrice: data.totalPrice });
      }
    } catch (err) {
      console.error("Price fetch error:", err);
    } finally {
      setSubPriceLoading(false);
    }
  };

  const handleAddSubscription = async () => {
    if (!subModal || subModal.place.id === undefined) return;
    const token = getToken();
    if (!token) return;
    const days = parseInt(subDays);
    if (!days || days <= 0) { setSubError("Please enter a valid number of days."); return; }
    setSubAddLoading(true);
    setSubError(null);
    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("parkPlaceID", String(subModal.place.id));
      formData.append("days", String(days));
      const response = await fetch("https://smartpark.htl-projekt.com/api_addSubscription.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      const data = await response.json();
      if (data.status === "success") {
        setSubSuccess(`Subscription activated until ${data.endDate?.split(" ")[0]}.`);
        setSubStatus((prev) => prev ? { ...prev, subscribed: 1, daysLeft: days, endDate: data.endDate } : prev);
      } else {
        setSubError(data.message ?? "Failed to add subscription.");
      }
    } catch (err) {
      setSubError(`Error: ${(err as Error).message}`);
    } finally {
      setSubAddLoading(false);
    }
  };

  const openPricingModal = async (place: ParkingPlace) => {
    setPricingModal({ place });
    setPricingData(null);
    setPricingError(null);
    setPricingSuccess(null);
    setPricingForm({ pModel: "hourly", hourly: "", daily: "", freeMin: "" });
    setPricingLoading(true);
    const token = getToken();
    if (!token || place.id === undefined) return;
    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("ppID", String(place.id));
      const response = await fetch("https://smartpark.htl-projekt.com/api_getPricingSystem.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      const rawText = await response.text();
      let data;
      try { data = JSON.parse(rawText); } catch { setPricingError("Server returned unexpected response."); return; }
      if (data.status === "success" && data.data?.length > 0) {
        const p = data.data[0];
        setPricingData(p);
        setPricingForm({
          pModel: p.pModel ?? "hourly",
          hourly: p.hourly != null ? String(p.hourly) : "",
          daily: p.daily != null ? String(p.daily) : "",
          freeMin: p.freeMin != null ? String(p.freeMin) : "",
        });
      }
    } catch (err) {
      setPricingError(`Error: ${(err as Error).message}`);
    } finally {
      setPricingLoading(false);
    }
  };

  const handleSavePricing = async () => {
    if (!pricingModal || pricingModal.place.id === undefined) return;
    const token = getToken();
    if (!token) return;
    if (!pricingForm.freeMin || !pricingForm.pModel) {
      setPricingError("Pricing model and free minutes are required.");
      return;
    }
    setPricingSaveLoading(true);
    setPricingError(null);
    setPricingSuccess(null);
    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("ppID", String(pricingModal.place.id));
      formData.append("pModel", pricingForm.pModel);
      formData.append("freeMin", pricingForm.freeMin);
      if (pricingForm.hourly) formData.append("hourly", pricingForm.hourly);
      if (pricingForm.daily) formData.append("daily", pricingForm.daily);
      const response = await fetch("https://smartpark.htl-projekt.com/api_addPricing.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      const rawText = await response.text();
      let data;
      try { data = JSON.parse(rawText); } catch { setPricingError("Server returned unexpected response."); return; }
      if (data.status === "success") {
        setPricingSuccess("Pricing saved successfully!");
        setTimeout(() => { setPricingModal(null); setPricingSuccess(null); }, 1500);
      } else {
        setPricingError(data.message || "Failed to save pricing.");
      }
    } catch (err) {
      setPricingError(`Error: ${(err as Error).message}`);
    } finally {
      setPricingSaveLoading(false);
    }
  };

  const getSortedParkingPlaces = () => {
    const sorted = [...parkingPlaces];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof ParkingPlace];
        const bValue = b[sortConfig.key as keyof ParkingPlace];
        if (typeof aValue === "string")
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue);
        if (typeof aValue === "number")
          return sortConfig.direction === "asc"
            ? aValue - (bValue as number)
            : (bValue as number) - aValue;
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">Parking Places Overview</h1>
            <p className="text-gray-600">Manage and monitor your parking place occupancy</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => { setShowAddModal(true); setAddError(null); }} className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Parking Place
            </Button>
            <Button variant="outline" onClick={() => router.back()}>Back</Button>
          </div>
        </div>

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

        <Card className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4" />
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
              <p className="text-gray-500 text-sm mt-2">Add your first parking place using the button above.</p>
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
                      {[
                        { key: "name", label: "Name" },
                        { key: "address", label: "Address" },
                        { key: "max_Spots", label: "Total Spots" },
                        { key: "occupied", label: "Occupied" },
                        { key: "freeSpots", label: "Available" },
                      ].map((col) => (
                        <th key={col.key} className="text-left py-4 px-3 font-semibold text-gray-700">
                          <button onClick={() => handleSort(col.key as keyof ParkingPlace)} className="flex items-center gap-2 hover:text-gray-900">
                            {col.label} <ArrowUpDown className="w-4 h-4" />
                          </button>
                        </th>
                      ))}
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">Restricted</th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">Accepted Cars</th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">Subscription</th>
                      <th className="text-left py-4 px-3 font-semibold text-gray-700">Pricing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedParkingPlaces.map((place, index) => {
                      const isRestricted = Boolean(place.restricted);
                      const isToggling = togglingId === place.id;
                      return (
                        <tr key={index} className="border-b hover:bg-yellow-500/5 transition-colors duration-150">
                          <td className="py-4 px-3 font-medium text-gray-900">{place.name}</td>
                          <td className="py-4 px-3 text-gray-700">
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />{place.address}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-gray-700"><Badge variant="outline">{place.max_Spots}</Badge></td>
                          <td className="py-4 px-3 text-red-600 font-semibold">{place.occupied}</td>
                          <td className="py-4 px-3 text-green-600 font-semibold">{place.freeSpots}</td>
                          <td className="py-4 px-3">
                            <button
                              onClick={() => handleToggleRestricted(place)}
                              disabled={isToggling || place.id === undefined}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border
                                ${isRestricted ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"}
                                ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              {isToggling ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : isRestricted ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                              {isRestricted ? "Restricted" : "Open"}
                            </button>
                          </td>
                          <td className="py-4 px-3">
                            <button
                              onClick={() => openAcceptedModal(place)}
                              disabled={place.id === undefined}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Users className="w-3 h-3" /> Accepted Cars
                            </button>
                          </td>
                          <td className="py-4 px-3">
                            <button
                              onClick={() => openSubModal(place)}
                              disabled={place.id === undefined}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CreditCard className="w-3 h-3" /> Subscription
                            </button>
                          </td>
                          <td className="py-4 px-3">
                            <button
                              onClick={() => openPricingModal(place)}
                              disabled={place.id === undefined}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Tag className="w-3 h-3" />
                              {/* Show current pricing summary on the button if data is loaded */}
                              Pricing
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => { setShowAddModal(false); setAddForm({ name: "", address: "", cap: "" }); setAddError(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Add Parking Place</h2>
            <p className="text-sm text-gray-500 mb-6">Fill in the details for your new parking place.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input type="text" placeholder="e.g. Central Parking" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <Input type="text" placeholder="e.g. Main Street 12, Vienna" value={addForm.address} onChange={(e) => setAddForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Spots)</label>
                <Input type="number" placeholder="e.g. 50" min={1} value={addForm.cap} onChange={(e) => setAddForm((f) => ({ ...f, cap: e.target.value }))} />
              </div>
              {addError && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{addError}</div>}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setShowAddModal(false); setAddForm({ name: "", address: "", cap: "" }); setAddError(null); }} disabled={addLoading}>Cancel</Button>
                <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white" onClick={handleAddParkPlace} disabled={addLoading}>
                  {addLoading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Adding...</span> : "Add Parking Place"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accepted Cars Modal */}
      {acceptedModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col max-h-[80vh]">
            <button onClick={() => setAcceptedModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Accepted Cars</h2>
            <p className="text-sm text-gray-500 mb-4">{acceptedModal.place.name} — {acceptedModal.place.address}</p>
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder="Plate number (e.g. W-12345A)"
                value={newPlate}
                onChange={(e) => { setNewPlate(e.target.value.toUpperCase()); setAddCarError(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddAcceptedCar(); }}
                className="flex-1"
              />
              <Button onClick={handleAddAcceptedCar} disabled={addCarLoading} className="bg-yellow-500 hover:bg-yellow-600 text-white shrink-0">
                {addCarLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>
            {addCarError && <div className="mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">{addCarError}</div>}
            <div className="overflow-y-auto flex-1">
              {acceptedLoading && <div className="flex justify-center items-center py-8"><span className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" /></div>}
              {acceptedError && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">{acceptedError}</div>}
              {!acceptedLoading && !acceptedError && acceptedCars.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No accepted cars yet. Add one above.</div>}
              {!acceptedLoading && !acceptedError && acceptedCars.length > 0 && (
                <ul className="space-y-2">
                  {acceptedCars.map((car) => (
                    <li key={car.plate_Number} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="font-mono font-semibold text-gray-800 tracking-wider text-sm">{car.plate_Number}</span>
                      <button onClick={() => handleDeleteAcceptedCar(car.plate_Number)} disabled={deletingPlate === car.plate_Number} className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50">
                        {deletingPlate === car.plate_Number ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="pt-4 border-t mt-4">
              <Button variant="outline" className="w-full" onClick={() => setAcceptedModal(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {subModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button onClick={() => setSubModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Subscription</h2>
            <p className="text-sm text-gray-500 mb-5">{subModal.place.name} — {subModal.place.address}</p>
            {subStatusLoading && <div className="flex justify-center py-8"><span className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" /></div>}
            {!subStatusLoading && subStatus && (
              <>
                {subStatus.isAdmin === 1 && (
                  <div className="flex flex-col items-center text-center py-4 gap-3">
                    <ShieldCheck className="w-12 h-12 text-yellow-500" />
                    <p className="font-semibold text-gray-800 text-lg">Admins are automatically subscribed</p>
                    <p className="text-sm text-gray-500">No subscription required for admin-owned parking places.</p>
                  </div>
                )}
                {subStatus.isAdmin === 0 && (
                  <div className="space-y-4">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${subStatus.subscribed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${subStatus.subscribed ? "text-green-500" : "text-red-400"}`} />
                      <div>
                        <p className={`text-sm font-semibold ${subStatus.subscribed ? "text-green-700" : "text-red-700"}`}>
                          {subStatus.subscribed ? "Active Subscription" : "No Active Subscription"}
                        </p>
                        {subStatus.subscribed && subStatus.endDate && (
                          <p className="text-xs text-green-600 mt-0.5">Expires: {subStatus.endDate.split(" ")[0]} · {subStatus.daysLeft} day{subStatus.daysLeft !== 1 ? "s" : ""} left</p>
                        )}
                        {!subStatus.subscribed && subStatus.endDate && (
                          <p className="text-xs text-red-500 mt-0.5">Expired: {subStatus.endDate.split(" ")[0]}</p>
                        )}
                      </div>
                    </div>
                    {!subSuccess && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{subStatus.subscribed ? "Extend by (days)" : "Subscribe for (days)"}</label>
                          <Input type="number" min={1} value={subDays} onChange={(e) => { setSubDays(e.target.value); setSubPrice(null); }} onBlur={() => { const d = parseInt(subDays); if (d > 0) fetchSubPrice(d); }} placeholder="e.g. 30" />
                          <p className="text-xs text-gray-400 mt-1">Leave field to calculate price</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 min-h-[56px] flex items-center justify-between">
                          {subPriceLoading ? (
                            <span className="text-sm text-gray-400 flex items-center gap-2"><span className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />Calculating...</span>
                          ) : subPrice ? (
                            <><span className="text-sm text-gray-600">{subPrice.pricePerDay} / day</span><span className="text-lg font-bold text-purple-700">€{subPrice.totalPrice}</span></>
                          ) : (
                            <span className="text-sm text-gray-400">Enter days to see price</span>
                          )}
                        </div>
                      </>
                    )}
                    {subError && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{subError}</div>}
                    {subSuccess && <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" />{subSuccess}</div>}
                    {!subSuccess && (
                      <div className="flex gap-3 pt-1">
                        <Button variant="outline" className="flex-1" onClick={() => setSubModal(null)} disabled={subAddLoading}>Cancel</Button>
                        <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" onClick={handleAddSubscription} disabled={subAddLoading || !subPrice}>
                          {subAddLoading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</span> : subStatus.subscribed ? "Extend" : "Subscribe"}
                        </Button>
                      </div>
                    )}
                    {subSuccess && <Button className="w-full" variant="outline" onClick={() => setSubModal(null)}>Close</Button>}
                  </div>
                )}
              </>
            )}
            {!subStatusLoading && subError && !subStatus && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{subError}</div>
            )}
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {pricingModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button onClick={() => setPricingModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Pricing</h2>
            <p className="text-sm text-gray-500 mb-5">{pricingModal.place.name} — {pricingModal.place.address}</p>

            {pricingLoading && (
              <div className="flex justify-center py-8">
                <span className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}

            {!pricingLoading && (
              <div className="space-y-4">

                {/* Current pricing summary */}
                {pricingData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
                    <p className="font-semibold mb-1.5">Current Pricing</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-700">
                      <span>Model: <strong className="capitalize">{pricingData.pModel}</strong></span>
                      {pricingData.hourly != null && <span>Hourly: <strong>€{pricingData.hourly}</strong></span>}
                      {pricingData.daily != null && <span>Daily: <strong>€{pricingData.daily}</strong></span>}
                      <span>Free minutes: <strong>{pricingData.freeMin}</strong></span>
                    </div>
                  </div>
                )}

                {/* Pricing Model Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Model</label>
                  <select
                    value={pricingForm.pModel}
                    onChange={(e) => setPricingForm((f) => ({ ...f, pModel: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                {/* Hourly rate — always visible */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 2.50"
                    value={pricingForm.hourly}
                    onChange={(e) => setPricingForm((f) => ({ ...f, hourly: e.target.value }))}
                  />
                </div>

                {/* Daily rate — always visible */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 15.00"
                    value={pricingForm.daily}
                    onChange={(e) => setPricingForm((f) => ({ ...f, daily: e.target.value }))}
                  />
                </div>

                {/* Free minutes — always visible */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Free Minutes</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 15"
                    value={pricingForm.freeMin}
                    onChange={(e) => setPricingForm((f) => ({ ...f, freeMin: e.target.value }))}
                  />
                  <p className="text-xs text-gray-400 mt-1">Minutes before billing starts</p>
                </div>

                {pricingError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{pricingError}</div>
                )}
                {pricingSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />{pricingSuccess}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <Button variant="outline" className="flex-1" onClick={() => setPricingModal(null)} disabled={pricingSaveLoading}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleSavePricing}
                    disabled={pricingSaveLoading}
                  >
                    {pricingSaveLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : pricingData ? "Update Pricing" : "Save Pricing"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}