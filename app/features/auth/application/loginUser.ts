import { AuthRepository } from "../domain/repositories/AuthRepository";

export const loginUser = async (
  authRepository: AuthRepository,
  email: string,
  password: string
) => {
  return authRepository.login(email, password);
};
