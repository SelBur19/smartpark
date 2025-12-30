import { AuthResult } from "../types/AuthResult";

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthResult>;
}
