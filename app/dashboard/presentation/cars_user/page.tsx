"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Car, Clock, CheckCircle, DollarSign } from "lucide-react";

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

  const router = useRouter();
  const euroToLek = 120;

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
          const text = await response.text();
          setError(`Failed to load sessions: ${response.status} ${response.statusText}`);
          console.error("Fetch sessions failed:", text);
          return;
        }

        const data = await response.json();
        if (data.status === "success") setSessions(data.data);
        else setError(data.message);
      } catch (err) {
        setError(`Failed to load sessions: ${(err as Error).message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [router]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
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
        if (typeof aValue === "string") return sortConfig.direction === "asc" ? aValue.localeCompare(bValue as string) : (bValue as string).localeCompare(aValue);
        if (typeof aValue === "number") return sortConfig.direction === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
        return 0;
      });
    }
    return filtered;
  };

  const filteredSessions = getFilteredAndSortedSessions();

  const stats = {
    totalSessions: sessions.length,
    totalEarnings: sessions.reduce((sum, s) => sum + (typeof s.cost === "number" && !Number.isNaN(s.cost) ? s.cost * euroToLek : 0), 0),
    activeSessions: sessions.filter((s) => s.status?.toLowerCase() === "active").length,
    completedSessions: sessions.filter((s) => s.status?.toLowerCase() === "completed").length,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto py-24">

        {/* ✅ HEADER like Cars page */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-yellow-500">
              My Parking Sessions
            </h1>

            <div className="flex gap-2">
              {/* optional: you can add an "Add Session" button here if needed */}
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
            </div>
          </div>
        </Card>

        {/* Statistics Cards */}
        {!loading && !error && sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

            <Card className="p-6 border border-blue-500/20 bg-gradient-to-br from-blue-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.completedSessions}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border border-purple-500/20 bg-gradient-to-br from-purple-50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalEarnings.toLocaleString()} Lek</p>
                </div>
                <DollarSign className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </Card>
          </div>
        )}

        {/* Sessions Table */}
        <Card className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
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
                      <tr key={idx} className="border-b hover:bg-yellow-500/5 transition-colors duration-150">
                        <td className="py-4 px-3 font-medium text-gray-900">{session.plate_Number}</td>
                        <td className="py-4 px-3 text-gray-700">
                          <Badge variant="outline">#{session.parkPlaceID}</Badge>
                        </td>
                        <td className="py-4 px-3 text-sm text-gray-600">{formatDate(session.entryTime)}</td>
                        <td className="py-4 px-3 text-sm text-gray-600">
                          {session.exitTime ? formatDate(session.exitTime) : <span className="text-yellow-600 font-medium">In Progress</span>}
                        </td>
                        <td className="py-4 px-3 font-semibold text-yellow-600">
                          {typeof session.cost === "number" && !Number.isNaN(session.cost) ? `${(session.cost * euroToLek).toLocaleString()} Lek` : "-"}
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
    </div>
  );
}