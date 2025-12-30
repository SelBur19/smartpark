import { AuthRepository } from "../domain/repositories/AuthRepository";
import { User } from "../domain/entities/User";
import { AuthResult } from "../domain/types/AuthResult";

export class AuthApiRepository implements AuthRepository {
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const response = await fetch(
        "http://smartpark.htl-projekt.com/api_login.php",
        { method: "POST", body: formData }
      );

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (data.status === "success") {
        const user = new User(data.id, data.email, data.name, data.role);
        // Token is stored in useLogin, not domain
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
