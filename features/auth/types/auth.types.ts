export interface LoginResponse {
  status: "success" | "error";
  message?: string;
  user?: {
    id: number;
    email: string;
  };
}
