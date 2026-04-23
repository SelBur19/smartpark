"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Car, Clock, CreditCard, X, CheckCircle } from "lucide-react";

interface Session {
  plate_Number: string;
  parkPlaceID: number;
  entryTime: string;
  exitTime: string | null;
  cost: number;
  status: string;
}

interface SortConfig {
  key: keyof Session | null;
  direction: "asc" | "desc";
}

export default function SessionsUsersPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });

  // Pay modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);

  const router = useRouter();
  const euroToLek = 120;

  const getToken = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    return JSON.parse(storedUser)?.token ?? null;
  };

  useEffect(() => {
    const fetchSessions = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return router.push("/login");

      const parsedUser = JSON.parse(storedUser);
      const token = parsedUser?.token;
      if (!token) return router.push("/login");

      try {
        const formData = new URLSearchParams();
        formData.append("token", token);

        const response = await fetch("https://smartpark.htl-projekt.com/api_getSessionsU.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        });

        if (!response.ok) {
          setError(`Failed to load sessions: ${response.status} ${response.statusText}`);
          return;
        }

        const data = await response.json();
        if (data.status === "success") setSessions(data.data);
        else setError(data.message);
      } catch (err) {
        setError(`Failed to load sessions: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [router]);

  const handleOpenPayModal = async () => {
    setShowPayModal(true);
    setPaySuccess(false);
    setPayError(null);
    setPriceError(null);
    setTotalPrice(null);
    setPriceLoading(true);

    const token = getToken();
    if (!token) { router.push("/login"); return; }

    try {
      const formData = new URLSearchParams();
      formData.append("token", token);

      const response = await fetch("https://smartpark.htl-projekt.com/api_getPrice.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        setPriceError("Server returned an unexpected response.");
        return;
      }

      if (data.status === "success") {
        const raw = parseFloat(data.price?.price ?? data.price ?? 0);
        setTotalPrice(isNaN(raw) ? 0 : raw);
      } else {
        setPriceError(data.message || "Failed to fetch price.");
      }
    } catch (err) {
      setPriceError(`Error: ${(err as Error).message}`);
    } finally {
      setPriceLoading(false);
    }
  };

  const handlePay = async () => {
    setPayLoading(true);
    setPayError(null);

    const token = getToken();
    if (!token) { router.push("/login"); return; }

    try {
      const formData = new URLSearchParams();
      formData.append("token", token);

      const response = await fetch("https://smartpark.htl-projekt.com/api_pay.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        setPayError("Server returned an unexpected response.");
        return;
      }

      if (data.status === "success") {
        setPaySuccess(true);
        // Refresh sessions after payment
        setTimeout(() => {
          setShowPayModal(false);
          setPaySuccess(false);
          window.location.reload();
        }, 1800);
      } else {
        setPayError(data.message || "Payment failed.");
      }
    } catch (err) {
      setPayError(`Error: ${(err as Error).message}`);
    } finally {
      setPayLoading(false);
    }
  };

  const handleClosePayModal = () => {
    if (payLoading) return;
    setShowPayModal(false);
    setTotalPrice(null);
    setPriceError(null);
    setPayError(null);
    setPaySuccess(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase() || "unknown";
    if (normalized === "active") return <Badge className="bg-green-600">Active</Badge>;
    if (normalized === "completed") return <Badge className="bg-blue-600">Completed</Badge>;
    if (normalized === "cancelled") return <Badge variant="destructive">Cancelled</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const handleSort = (key: keyof Session) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getFilteredAndSortedSessions = () => {
    let filtered = [...sessions];
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
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
    return filtered;
  };

  const filteredSessions = getFilteredAndSortedSessions();

  const stats = {
    totalSessions: sessions.length,
    activeSessions: sessions.filter((s) => s.status?.toLowerCase() === "active").length,
  };

  const hasPending = sessions.some((s) => s.status?.toLowerCase() === "pending");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto py-8 px-4 md:py-24">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">
              My Parking Sessions
            </h1>
            <p className="text-gray-600">View and track your parking session history</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenPayModal}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay All Sessions
            </Button>
            <Button variant="outline" onClick={() => router.back()}>Back</Button>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && !error && sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="p-6 border border-yellow-500/20 bg-gradient-to-br from-yellow-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Sessions</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.totalSessions}</p>
                </div>
                <Car className="w-10 h-10 text-yellow-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border border-green-500/20 bg-gradient-to-br from-green-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Sessions</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeSessions}</p>
                </div>
                <Clock className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </Card>
          </div>
        )}

        {/* Sessions Table */}
        <Card className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading sessions...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && sessions.length === 0 && (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No sessions found.</p>
              <p className="text-gray-500 text-sm mt-2">Your parking sessions will appear here.</p>
            </div>
          )}

          {!loading && !error && sessions.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {filteredSessions.length} of {sessions.length} sessions
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      {[
                        { key: "plate_Number", label: "License Plate" },
                        { key: "parkPlaceID", label: "Parking Spot" },
                        { key: "entryTime", label: "Entry Time" },
                        { key: "exitTime", label: "Exit Time" },
                        { key: "cost", label: "Cost (Lek)" },
                        { key: "status", label: "Status" },
                      ].map((col) => (
                        <th key={col.key} className="text-left py-4 px-3 font-semibold text-gray-700">
                          <button
                            onClick={() => handleSort(col.key as keyof Session)}
                            className="flex items-center gap-2 hover:text-gray-900"
                          >
                            {col.label} <ArrowUpDown className="w-4 h-4" />
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session, idx) => (
                      <tr
                        key={idx}
                        className="border-b hover:bg-yellow-500/5 transition-colors duration-150"
                      >
                        <td className="py-4 px-3 font-medium text-gray-900">{session.plate_Number}</td>
                        <td className="py-4 px-3 text-gray-700">
                          <Badge variant="outline">#{session.parkPlaceID}</Badge>
                        </td>
                        <td className="py-4 px-3 text-sm text-gray-600">{formatDate(session.entryTime)}</td>
                        <td className="py-4 px-3 text-sm text-gray-600">
                          {session.exitTime ? (
                            formatDate(session.exitTime)
                          ) : (
                            <span className="text-yellow-600 font-medium">In Progress</span>
                          )}
                        </td>
                        <td className="py-4 px-3 font-semibold text-yellow-600">
                          {typeof session.cost === "number" && !Number.isNaN(session.cost)
                            ? `${(session.cost * euroToLek).toLocaleString()} Lek`
                            : "-"}
                        </td>
                        <td className="py-4 px-3">{getStatusBadge(session.status)}</td>
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

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pay All Sessions</h2>
              <button
                onClick={handleClosePayModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={payLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success state */}
            {paySuccess ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <CheckCircle className="w-14 h-14 text-green-500" />
                <p className="text-green-700 font-semibold text-lg">Payment Successful!</p>
                <p className="text-gray-500 text-sm">All sessions have been marked as paid.</p>
              </div>
            ) : (
              <>
                {/* Price loading */}
                {priceLoading && (
                  <div className="flex flex-col items-center py-8 gap-3">
                    <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Calculating total...</p>
                  </div>
                )}

                {/* Price error */}
                {priceError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{priceError}</p>
                  </div>
                )}

                {/* Price display */}
                {!priceLoading && totalPrice !== null && (
                  <div className="mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center mb-4">
                      <p className="text-sm text-gray-500 mb-1">Total Amount Due</p>
                      <p className="text-4xl font-bold text-green-600">
                        {(totalPrice * euroToLek).toLocaleString()} Lek
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        ({totalPrice.toFixed(2)} €)
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      This will mark all pending sessions as <span className="font-semibold text-green-600">Paid</span>.
                    </p>
                  </div>
                )}

                {/* Pay error */}
                {payError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{payError}</p>
                  </div>
                )}

                {/* Footer buttons */}
                {!priceLoading && (
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" onClick={handleClosePayModal} disabled={payLoading}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handlePay}
                      disabled={payLoading || totalPrice === null || !!priceError}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {payLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" /> Confirm Payment
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}