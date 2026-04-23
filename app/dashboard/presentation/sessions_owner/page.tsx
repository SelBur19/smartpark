"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Session {
  plate_Number: string;
  parkPlaceID: number;
  entryTime: string;
  exitTime: string;
  cost: number;
  status: string;
}

export default function SessionsOwnerPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
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
          "https://smartpark.htl-projekt.com/api_getSessionsO.php",
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
            "Failed to fetch sessions",
            response.status,
            response.statusText,
            text
          );
          setError(`Failed to load sessions: ${response.status} ${response.statusText}`);
          return;
        }

        const data = await response.json();
        console.log("SESSIONS RESPONSE:", response.url, response.status, data);

        if (data.status === "success") {
          setSessions(data.data ?? []);
        } else {
          setError(data.message || "Unexpected response from server");
        }
      } catch (err) {
        console.error("Fetch sessions error:", err);
        setError(`Failed to load sessions: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto py-24">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-yellow-500">Sessions Owner</h1>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>

          {loading && <p>Loading sessions...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && sessions.length === 0 && (
            <p>No session records found.</p>
          )}

          {!loading && !error && sessions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Plate Number</th>
                    <th className="text-left py-2">Parking Spot ID</th>
                    <th className="text-left py-2">Entry Time</th>
                    <th className="text-left py-2">Exit Time</th>
                    <th className="text-left py-2">Cost</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, index) => (
                    <tr key={index} className="border-b hover:bg-yellow-500/5">
                      <td className="py-2">{session.plate_Number}</td>
                      <td className="py-2">{session.parkPlaceID}</td>
                      <td className="py-2">{session.entryTime}</td>
                      <td className="py-2">{session.exitTime}</td>
                      <td className="py-2">{session.cost}</td>
                      <td className="py-2">{session.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}
