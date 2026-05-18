/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// 🔧 DEV TOGGLE
// Flip this to test the UI in logged-in vs logged-out state.
// When the real backend is wired, replace this with a check that
// hydrates from localStorage / a refresh-token call on mount.
// ─────────────────────────────────────────────────────────────────────────────
const DEV_LOGGED_IN = true;

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt: string; // ISO
};

export const MOCK_USER: User = {
  id: 1,
  firstName: "Jan",
  lastName: "de Vries",
  email: "jan@example.com",
  joinedAt: "2024-08-12",
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEV_LOGGED_IN ? MOCK_USER : null);

  // TODO: wire to POST /api/auth/login when backend exists.
  const login = useCallback(async (email: string, _password: string) => {
    setUser({ ...MOCK_USER, email: email || MOCK_USER.email });
  }, []);

  // TODO: wire to POST /api/auth/register when backend exists.
  const register = useCallback(async (data: Partial<User> & { password: string }) => {
    setUser({
      ...MOCK_USER,
      firstName: data.firstName ?? MOCK_USER.firstName,
      lastName: data.lastName ?? MOCK_USER.lastName,
      email: data.email ?? MOCK_USER.email,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
