"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../services/authService";
import { LoginResponse } from "../types/auth.types";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data: LoginResponse = await loginUser(email, password);

      if (data.status === "success") {
        setMessage("Login successful! ✓");
        localStorage.setItem("user", JSON.stringify(data));

        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setMessage("Error: " + (data.message || "Invalid login credentials"));
      }
    } catch {
      setMessage("Something went wrong.");
    }
  };

  return {
    email,
    password,
    message,
    setEmail,
    setPassword,
    handleLogin,
  };
};
