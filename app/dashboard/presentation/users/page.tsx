"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ShieldCheck } from "lucide-react";
import { User } from "@/dashboard/domain/entities/User";

const ROLES = ["User", "Owner", "Admin"] as const;
type Role = (typeof ROLES)[number];

const roleStyles: Record<Role, string> = {
  User: "bg-gray-100 text-gray-700 border-gray-200",
  Owner: "bg-blue-50 text-blue-700 border-blue-200",
  Admin: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Change role modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleEmail, setRoleEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("User");
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [roleSuccess, setRoleSuccess] = useState<string | null>(null);

  const router = useRouter();

  const getToken = (): string | null => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    return JSON.parse(storedUser)?.token ?? null;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) { router.push("/login"); return; }
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.token) { router.push("/login"); return; }

      try {
        const formData = new URLSearchParams();
        formData.append("token", parsedUser.token);

        const response = await fetch(
          "https://smartpark.htl-projekt.com/api_getUsers.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
          }
        );

        if (!response.ok) {
          setError(`Failed to load users: ${response.status} ${response.statusText}`);
          return;
        }

        const data = await response.json();
        if (data.status === "success") {
          setUsers(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(`Failed to load users: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  const handleChangeRole = async () => {
    const token = getToken();
    if (!token) return;

    if (!roleEmail.trim()) {
      setRoleError("Email is required.");
      return;
    }

    setRoleLoading(true);
    setRoleError(null);
    setRoleSuccess(null);

    try {
      const formData = new URLSearchParams();
      formData.append("token", token);
      formData.append("email", roleEmail.trim());
      formData.append("role", selectedRole);

      const response = await fetch(
        "https://smartpark.htl-projekt.com/api_changeRole.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setRoleSuccess(`Role changed to "${selectedRole}" for ${roleEmail.trim()}.`);
        // Update local table if user exists in list
        setUsers((prev) =>
          prev.map((u) =>
            u.email === roleEmail.trim() ? { ...u, role: selectedRole } : u
          )
        );
        setRoleEmail("");
        setSelectedRole("User");
      } else {
        setRoleError(data.message ?? "Failed to change role.");
      }
    } catch (err) {
      setRoleError(`Error: ${(err as Error).message}`);
    } finally {
      setRoleLoading(false);
    }
  };

  const openModal = () => {
    setShowRoleModal(true);
    setRoleEmail("");
    setSelectedRole("User");
    setRoleError(null);
    setRoleSuccess(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto py-24">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-yellow-500">Users</h1>
            <div className="flex items-center gap-3">
              <Button
                onClick={openModal}
                className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Change Role
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
            </div>
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
                  <tr key={u.id} className="border-b hover:bg-yellow-500/5">
                    <td className="py-2">{u.id}</td>
                    <td className="py-2">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          roleStyles[u.role as Role] ?? "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </main>

      <Footer />

      {/* Change Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setShowRoleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-1">Change User Role</h2>
            <p className="text-sm text-gray-500 mb-6">Enter the user's email and select a new role.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={roleEmail}
                  onChange={(e) => { setRoleEmail(e.target.value); setRoleError(null); setRoleSuccess(null); }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="flex gap-2">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        selectedRole === role
                          ? roleStyles[role] + " ring-2 ring-offset-1 " + (
                              role === "Admin" ? "ring-yellow-400" :
                              role === "Owner" ? "ring-blue-400" : "ring-gray-400"
                            )
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {roleError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                  {roleError}
                </div>
              )}

              {roleSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                  {roleSuccess}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRoleModal(false)}
                  disabled={roleLoading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={handleChangeRole}
                  disabled={roleLoading}
                >
                  {roleLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Change Role"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
