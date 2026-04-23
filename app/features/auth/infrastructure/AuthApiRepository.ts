import { AuthRepository } from "../domain/repositories/AuthRepository";
import { User } from "../domain/entities/User";
import { AuthResult } from "../domain/types/AuthResult";

export class AuthApiRepository implements AuthRepository {
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (data.status === "success") {
        const user = new User(
          data.id,
          data.email,
          data.name,
          data.role,
          data.token,
          data.status
        );
        return { status: "success", user };
      }

      return {
        status: "error",
        message: data.message ?? "Invalid login credentials",
      };
    } catch (err) {
      console.error("Login error:", err);
      return { status: "error", message: "Network or server error" };
    }
  }
}
