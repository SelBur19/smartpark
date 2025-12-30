"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../../application/loginUser";
import { AuthApiRepository } from "../../infrastructure/AuthApiRepository";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const authRepository = new AuthApiRepository();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await loginUser(authRepository, email, password);

    if (result.status === "success") {
      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(result.user));

      // Store token separately if backend returns it
      const token = (window as any).LOGIN_RESPONSE?.token ?? "";
      if (token) localStorage.setItem("token", token);

      setMessage("Login successful ✓");
      setTimeout(() => router.push("/dashboard"), 1000);
    } else {
      setMessage(result.message);
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
