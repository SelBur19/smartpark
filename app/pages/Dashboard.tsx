"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User as UserIcon, BarChart3, Settings, Users, Building, Car, MapPin } from "lucide-react";
import { useDashboard } from "@/dashboard/presentation/useDashboard";
import { User } from "@/dashboard/domain/entities/User";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="p-6 bg-card border-border hover:shadow-xl hover:shadow-yellow-500/10 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-8 w-8 text-yellow-500" />
          <h3 className="text-xl font-semibold text-yellow-500">Total Users</h3>
        </div>
        <p className="text-3xl font-bold text-yellow-500 mb-2">1,247</p>
        <p className="text-foreground/70">+12% from last month</p>
      </Card>

      <Card className="p-6 bg-card border-border hover:shadow-xl hover:shadow-yellow-500/10 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <Building className="h-8 w-8 text-yellow-500" />
          <h3 className="text-xl font-semibold text-yellow-500">Parking Lots</h3>
        </div>
        <p className="text-3xl font-bold text-yellow-500 mb-2">45</p>
        <p className="text-foreground/70">3 new this month</p>
      </Card>
    </div>
  );

  const renderUserContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border-border hover:shadow-xl hover:shadow-yellow-500/10 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-8 w-8 text-yellow-500" />
            <h3 className="text-xl font-semibold text-yellow-500">Available Parking</h3>
          </div>
          <div className="space-y-3">
            {parkingSpots.map((spot) => (
              <div
                key={spot.id}
                className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg"
              >
                <div>
                  <p className="font-medium text-yellow-700 dark:text-yellow-400">{spot.location}</p>
                  <p className="text-sm text-foreground/70">{spot.price}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-500">
                    {spot.available}/{spot.total}
                  </p>
                  <p className="text-sm text-foreground/70">available</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card border-border hover:shadow-xl hover:shadow-yellow-500/10 transition-all">
          <div className="flex items-center gap-3 mb-4">
            <Car className="h-8 w-8 text-yellow-500" />
            <h3 className="text-xl font-semibold text-yellow-500">Recent Bookings</h3>
          </div>
          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg"
              >
                <div>
                  <p className="font-medium text-yellow-700 dark:text-yellow-400">{b.location}</p>
                  <p className="text-sm text-foreground/70">
                    {b.date} at {b.time}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    b.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderOwnerContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="p-6 bg-card border-border hover:shadow-xl hover:shadow-yellow-500/10 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <Building className="h-8 w-8 text-yellow-500" />
          <h3 className="text-xl font-semibold text-yellow-500">My Properties</h3>
        </div>
        <p className="text-3xl font-bold text-yellow-500 mb-2">8</p>
        <p className="text-foreground/70">Total parking lots</p>
      </Card>

      <Card className="p-6 bg-card border-border hover:shadow-xl hover:shadow-yellow-500/10 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-8 w-8 text-yellow-500" />
          <h3 className="text-xl font-semibold text-yellow-500">Monthly Revenue</h3>
        </div>
        <p className="text-3xl font-bold text-yellow-500 mb-2">$3,450</p>
        <p className="text-foreground/70">+15% from last month</p>
      </Card>

      <Card className="p-6 bg-card border-border hover:shadow-xl hover:shadow-yellow-500/10 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <Car className="h-8 w-8 text-yellow-500" />
          <h3 className="text-xl font-semibold text-yellow-500">Total Bookings</h3>
        </div>
        <p className="text-3xl font-bold text-yellow-500 mb-2">127</p>
        <p className="text-foreground/70">This month</p>
      </Card>
    </div>
  );

    const renderSuperAdminContent = () => (
      //TODO: Superadmin view
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="p-6 bg-card border-border hover:shadow-xl hover:shadow-yellow-500/10 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <Building className="h-8 w-8 text-yellow-500" />
          <h3 className="text-xl font-semibold text-yellow-500">My Properties</h3>
        </div>
        <p className="text-3xl font-bold text-yellow-500 mb-2">8</p>
        <p className="text-foreground/70">Total parking lots</p>
      </Card>

      <Card className="p-6 bg-card border-border hover:shadow-xl hover:shadow-yellow-500/10 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-8 w-8 text-yellow-500" />
          <h3 className="text-xl font-semibold text-yellow-500">Monthly Revenue</h3>
        </div>
        <p className="text-3xl font-bold text-yellow-500 mb-2">$3,450</p>
        <p className="text-foreground/70">+15% from last month</p>
      </Card>

      <Card className="p-6 bg-card border-border hover:shadow-xl hover:shadow-yellow-500/10 transition-all">
        <div className="flex items-center gap-3 mb-4">
          <Car className="h-8 w-8 text-yellow-500" />
          <h3 className="text-xl font-semibold text-yellow-500">Total Bookings</h3>
        </div>
        <p className="text-3xl font-bold text-yellow-500 mb-2">127</p>
        <p className="text-foreground/70">This month</p>
      </Card>
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

      <Button className="w-full mt-6 bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg hover:shadow-yellow-500/30 transition-all">
        Edit Profile
      </Button>
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
      case "SuperAdmin":
        return renderSuperAdminContent();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-24 container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, {user.name}!</h1>
          <p className="text-foreground/70">{user.role} Dashboard</p>
        </div>

        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === "profile" ? "text-primary border-b-2 border-primary" : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <UserIcon className="inline h-4 w-4 mr-2" /> Profile
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === "dashboard" ? "text-primary border-b-2 border-primary" : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <BarChart3 className="inline h-4 w-4 mr-2" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === "settings" ? "text-primary border-b-2 border-primary" : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <Settings className="inline h-4 w-4 mr-2" /> Settings
          </button>
        </div>

        {activeTab === "profile" && renderProfile()}
        {activeTab === "dashboard" && renderRoleDashboard()}
        {activeTab === "settings" && (
          <Card className="p-6 bg-card border-border">
            <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
            <div className="space-y-4">
              <Button className="w-full justify-start outline">Change Password</Button>
              <Button className="w-full justify-start outline">Notification Settings</Button>
              <Button className="w-full justify-start outline">Privacy Settings</Button>
              <Button className="w-full destructive">Delete Account</Button>
            </div>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;
