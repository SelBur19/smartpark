export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "User" | "Owner"; // restrict possible roles
  status?: string;                   // optional, e.g., active/inactive
}
