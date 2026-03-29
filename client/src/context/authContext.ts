import { createContext } from "react";
import { User } from "../types";

export interface AuthState {
  token: string | null;
  user: User | null;
}

export interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
