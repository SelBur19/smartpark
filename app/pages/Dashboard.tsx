"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { User, Car, MapPin, Settings, BarChart3, Users, Building } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserData {
  name: string;
  email: string;
  role: string;
  status: string;
  message: string;
}

const Dashboard = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  // Mock data for dashboard
  const mockParkingSpots = [
    { id: 1, location: "Downtown Mall", available: 15, total: 50, price: "$2/hr" },
    { id: 2, location: "City Center", available: 8, total: 30, price: "$3/hr" },
    { id: 3, location: "Airport Terminal", available: 22, total: 100, price: "$5/hr" }
  ];

  const mockBookings = [
    { id: 1, location: "Downtown Mall", date: "2024-01-15", time: "14:30", status: "Active" },
    { id: 2, location: "City Center", date: "2024-01-10", time: "09:15", status: "Completed" },
    { id: 3, location: "Airport Terminal", date: "2024-01-08", time: "16:45", status: "Completed" }
  ];

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      localStorage.removeItem("user");
    }
  }, []);

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
            <p className="text-foreground/70 mb-6">Please login to access dashboard</p>
            <Link href="/login" className="text-primary hover:underline">Go to Login</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
            {mockParkingSpots.map(spot => (
              <div key={spot.id} className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-700 dark:text-yellow-400">{spot.location}</p>
                  <p className="text-sm text-foreground/70">{spot.price}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-500">{spot.available}/{spot.total}</p>
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
            {mockBookings.map(booking => (
              <div key={booking.id} className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-700 dark:text-yellow-400">{booking.location}</p>
                  <p className="text-sm text-foreground/70">{booking.date} at {booking.time}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status}
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

  const renderProfileContent = () => (
    <Card className="p-6 bg-card border-border hover:shadow-xl hover:shadow-yellow-500/10 transition-all">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-yellow-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-yellow-500">{userData.name}</h2>
          <p className="text-foreground/70">{userData.email}</p>
          <span className="inline-block px-3 py-1 bg-yellow-500/10 text-yellow-700 rounded-full text-sm font-medium">
            {userData.role}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
          <p className="p-3 bg-secondary rounded-md text-yellow-700 dark:text-yellow-400">{userData.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <p className="p-3 bg-secondary rounded-md text-yellow-700 dark:text-yellow-400">{userData.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Role</label>
          <p className="p-3 bg-secondary rounded-md text-yellow-700 dark:text-yellow-400">{userData.role}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Account Status</label>
          <p className="p-3 bg-secondary rounded-md text-yellow-700 dark:text-yellow-400">{userData.status}</p>
        </div>
      </div>
      
      <Button className="w-full mt-6 bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg hover:shadow-yellow-500/30 transition-all">
        Edit Profile
      </Button>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome back, {userData.name}!
            </h1>
            <p className="text-foreground/70">
              {userData.role} Dashboard
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === "profile"
                  ? "text-primary border-b-2 border-primary"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <User className="inline h-4 w-4 mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "text-primary border-b-2 border-primary"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <BarChart3 className="inline h-4 w-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === "settings"
                  ? "text-primary border-b-2 border-primary"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <Settings className="inline h-4 w-4 mr-2" />
              Settings
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "profile" && renderProfileContent()}
            {activeTab === "dashboard" && (
              <div>
                {userData.role === "Admin" && renderAdminContent()}
                {userData.role === "User" && renderUserContent()}
                {userData.role === "Owner" && renderOwnerContent()}
              </div>
            )}
            {activeTab === "settings" && (
              <Card className="p-6 bg-card border-border">
                <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <Button className="w-full justify-start outline">
                    Change Password
                  </Button>
                  <Button className="w-full justify-start outline">
                    Notification Settings
                  </Button>
                  <Button className="w-full justify-start outline">
                    Privacy Settings
                  </Button>
                  <Button className="w-full destructive">
                    Delete Account
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
