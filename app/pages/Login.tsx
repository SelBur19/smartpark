"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import Link from "next/link";
import { useLogin } from "@/features/auth/presentation/hooks/useLogin";

const LoginPage = () => {
  const {
    email,
    password,
    message,
    setEmail,
    setPassword,
    handleLogin,
  } = useLogin();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-3xl font-bold text-center mb-6">
            Welcome <span className="text-yellow-500">Back</span>
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full bg-yellow-500">
              Login
            </Button>
          </form>

          {message && (
            <p
              className={`text-center mt-4 ${
                message.includes("successful")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <p className="text-center mt-6">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-yellow-500 font-semibold">
              Sign up
            </Link>
          </p>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
