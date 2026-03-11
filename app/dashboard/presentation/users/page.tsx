"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "@/dashboard/domain/entities/User";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
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
          "http://smartpark.htl-projekt.com/api_getUsers.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
          }
        );

        const data = await response.json();

        if (data.status === "success") {
          setUsers(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto py-24">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-yellow-500">
              Users
            </h1>

            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>

          {loading && <p>Loading users...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">ID</th>
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b hover:bg-yellow-500/5"
                  >
                    <td className="py-2">{u.id}</td>
                    <td className="py-2">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}