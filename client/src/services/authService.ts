import api from "./api";
import { User } from "../types";

interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: string;
  badgeNumber: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const registerUser = async (data: RegisterPayload): Promise<void> => {
  await api.post("/auth/register", data);
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/auth/login", { email, password });
  return res.data;
};
