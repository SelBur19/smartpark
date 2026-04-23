"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginUser } from "../../application/loginUser";
import { AuthApiRepository } from "../../infrastructure/AuthApiRepository";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const authRepository = new AuthApiRepository();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    console.log("Starting login with email:", email, "password:", password);

    const result = await loginUser(authRepository, email, password);

    console.log("Login result:", result);

    if (result.status === "success") {
      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(result.user));
      // Store token separately if backend returns it
      //const token = (window as any).LOGIN_RESPONSE?.token ?? "";
      

      setMessage("Login successful");
      setTimeout(() => router.push("/dashboard/presentation"), 1000);
    } else {
      setMessage(result.message);
    }
    setLoading(false);
  };

  return {
    email,
    password,
    message,
    loading,
    setEmail,
    setPassword,
    handleLogin,
  };
};
