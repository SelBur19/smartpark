"use client";
import React, { useState, FormEvent, ChangeEvent } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Signup = () => {
  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [role, setRole] = useState<string>("User");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Build URL-encoded form data
    const formData = new URLSearchParams();
    formData.append("name", fullname); // PHP expects 'name'
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);

    try {
      const res = await fetch("http://smartpark.htl-projekt.com/api_addUser.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const data = await res.json();

      if (data.status === "success") {
        alert("Registration successful!");
        setFullname("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRole("User");
        router.push('/login');
      } else {
        alert("Registration failed: " + data.message);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <Card className="w-full max-w-md p-8 bg-card border-border hover:shadow-2xl hover:shadow-yellow-500/20 transition-all">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <img
                src="/logo_web_final.png"
                alt="Smart Park Logo"
                className="h-12 w-12"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">
            Create <span className="text-yellow-500">Account</span>
          </h1>
          <p className="text-foreground text-center mb-8">
            Join us and start <span className="text-yellow-500 font-semibold">managing your parking</span> today
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                value={fullname}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFullname(e.target.value)}
                className="bg-secondary border-border text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="bg-secondary border-border text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="bg-secondary border-border text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                className="bg-secondary border-border text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Register as
              </label>
              <select
                value={role}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
                className="w-full p-3 bg-secondary border border-border rounded-md text-foreground focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              >
                <option value="Admin">Admin</option>
                <option value="User">User</option>
                <option value="Owner">Owner</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg hover:shadow-yellow-500/30 transition-all">
              Create Account
            </Button>
          </form>

          <p className="text-center text-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-yellow-500 hover:text-yellow-600 hover:underline font-semibold">
              Login
            </Link>
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
