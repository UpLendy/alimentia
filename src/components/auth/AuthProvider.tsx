"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  loginRequest,
  logoutRequest,
  refreshSession,
  registerSessionExpiredHandler,
  setAccessToken,
  type AuthUser,
} from "@/lib/api";

// Solo se guarda el perfil (no sensible) para no perder el nombre/rol al
// recargar la página. El access token nunca se persiste: se vuelve a
// pedir con refreshSession() usando la cookie httpOnly del refreshToken.
const USER_KEY = "bpm_user";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    registerSessionExpiredHandler(clearSession);
  }, [clearSession]);

  useEffect(() => {
    (async () => {
      const token = await refreshSession();
      if (token) {
        const storedUser = sessionStorage.getItem(USER_KEY);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser) as AuthUser);
          } catch {
            sessionStorage.removeItem(USER_KEY);
          }
        }
      } else {
        sessionStorage.removeItem(USER_KEY);
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await loginRequest(email, password);
    setAccessToken(token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
