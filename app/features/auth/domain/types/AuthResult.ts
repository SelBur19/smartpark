import { User } from "../entities/User";

export type AuthResult =
  | {
      status: "success";
      user: User;
    }
  | {
      status: "error";
      message: string;
    };
