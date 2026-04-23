"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User as UserIcon, BarChart3, Users, Building, Car } from "lucide-react";
import { useDashboard } from "@/dashboard/presentation/useDashboard";
import { User } from "@/features/auth/domain/entities/User";

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();
  const { parkingSpots, bookings, loading } = useDashboard();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  if (!user) return null;

  const renderAdminContent = () => (
    <div className="space-y-10">

      <div>
        <h2 className="text-lg font-semibold mb-4">Admin</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Button onClick={() => router.push("/dashboard/presentation/users")} className="bg-yellow-500 text-white hover:bg-yellow-600">
            View All Users
          </Button>

          <Button onClick={() => router.push("/dashboard/presentation/registered_cars")} className="bg-yellow-500 text-white hover:bg-yellow-600">
            Registered Cars
          </Button>

          <Button onClick={() => router.push("/dashboard/presentation/sessions_admin")} className="bg-yellow-500 text-white hover:bg-yellow-600">
            Sessions
          </Button>

          <Button onClick={() => router.push("/dashboard/presentation/all_parkplaces")} className="bg-yellow-500 text-white hover:bg-yellow-600">
            All Parkplaces
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Owner</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button onClick={() => router.push("/dashboard/presentation/sessions_owner")} className="bg-yellow-500 text-white hover:bg-yellow-600">
            Session
          </Button>

          <Button onClick={() => router.push("/dashboard/presentation/parking_owner")} className="bg-yellow-500 text-white hover:bg-yellow-600">
            Parkplace
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">User</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button onClick={() => router.push("/dashboard/presentation/sessions_users")} className="bg-yellow-500 text-white hover:bg-yellow-600">
            Session
          </Button>

          <Button onClick={() => router.push("/dashboard/presentation/cars_user")} className="bg-yellow-500 text-white hover:bg-yellow-600">
            Cars
          </Button>
        </div>
      </div>

    </div>
  );

  const renderUserContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Button onClick={() => router.push("/dashboard/presentation/sessions_users")} className="bg-yellow-500 text-white hover:bg-yellow-600">
          Session
        </Button>

        <Button onClick={() => router.push("/dashboard/presentation/cars_user")} className="bg-yellow-500 text-white hover:bg-yellow-600">
          Cars
        </Button>
      </div>
    </div>
  );

  const renderOwnerContent = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Owner</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Button onClick={() => router.push("/dashboard/presentation/sessions_owner")} className="bg-yellow-500 text-white hover:bg-yellow-600">
          Session


        </Button>

        <Button onClick={() => router.push("/dashboard/presentation/parking_owner")} className="bg-yellow-500 text-white hover:bg-yellow-600">
          Parkplace
        </Button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">User</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button onClick={() => router.push("/dashboard/presentation/sessions_users")} className="bg-yellow-500 text-white hover:bg-yellow-600">
            Session
          </Button>

          <Button onClick={() => router.push("/dashboard/presentation/cars_user")} className="bg-yellow-500 text-white hover:bg-yellow-600">
            Cars
          </Button>
        </div>
      </div>
    </div>
  );


  const renderProfile = () => (
    <Card className="p-6 bg-card border-border hover:shadow-xl hover:shadow-yellow-500/10 transition-all">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
          <UserIcon className="h-8 w-8 text-yellow-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-yellow-500">{user.name}</h2>
          <p className="text-foreground/70">{user.email}</p>
          <span className="inline-block px-3 py-1 bg-yellow-500/10 text-yellow-700 rounded-full text-sm font-medium">
            {user.role}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
          <p className="p-3 bg-secondary rounded-md text-yellow-700 dark:text-yellow-400">{user.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <p className="p-3 bg-secondary rounded-md text-yellow-700 dark:text-yellow-400">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Role</label>
          <p className="p-3 bg-secondary rounded-md text-yellow-700 dark:text-yellow-400">{user.role}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Account Status</label>
          <p className="p-3 bg-secondary rounded-md text-yellow-700 dark:text-yellow-400">{user.status || "Active"}</p>
        </div>
      </div>

    </Card>
  );

  const renderRoleDashboard = () => {
    switch (user.role) {
      case "Admin":
        return renderAdminContent();
      case "User":
        return renderUserContent();
      case "Owner":
        return renderOwnerContent();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-24 container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-foreground/70">{user.role} Dashboard</p>
        </div>

        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-1 font-medium ${
              activeTab === "profile"
                ? "text-primary border-b-2 border-primary"
                : "text-foreground/70"
            }`}
          >
            <UserIcon className="inline h-4 w-4 mr-2" /> Profile
          </button>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`pb-3 px-1 font-medium ${
              activeTab === "dashboard"
                ? "text-primary border-b-2 border-primary"
                : "text-foreground/70"
            }`}
          >
            <BarChart3 className="inline h-4 w-4 mr-2" /> Dashboard
          </button>
        </div>

        {activeTab === "profile" && renderProfile()}
        {activeTab === "dashboard" && renderRoleDashboard()}
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;