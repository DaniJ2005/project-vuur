/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from 'react';
import { useMe } from './auth.hooks';
import type { UserResponse } from './auth.types';

interface AuthCtx {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useMe();

  return (
    <Ctx.Provider
      value={{
        user: data ?? null,
        isLoading,
        isAuthenticated: !!data,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth moet binnen <AuthProvider> gebruikt worden');
  return ctx;
}