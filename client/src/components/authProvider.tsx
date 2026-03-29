import { useState, ReactNode } from "react";
import { AuthContext, AuthState } from "../context/authContext";
import { User } from "../types";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
  });

  const login = (token: string, user: User) => {
    setState({ token, user });
  };

  const logout = () => {
    setState({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
