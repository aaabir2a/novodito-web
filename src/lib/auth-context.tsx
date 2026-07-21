"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  tryRefresh,
  updateProfile as apiUpdateProfile,
  type LoginInput,
  type PlayerProfile,
  type ProfileUpdateInput,
  type RegisterInput,
} from "./api";

interface AuthState {
  user: PlayerProfile | null;
  /** True until the initial silent-refresh bootstrap resolves. */
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: ProfileUpdateInput) => Promise<PlayerProfile>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap: the access token lives only in memory, so on a fresh load we try
  // to recover a session from the httpOnly refresh cookie, then load the profile.
  useEffect(() => {
    let alive = true;
    (async () => {
      const ok = await tryRefresh();
      if (ok) {
        try {
          const me = await getMe();
          if (alive) setUser(me);
        } catch {
          if (alive) setUser(null);
        }
      }
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    await apiLogin(input);
    setUser(await getMe());
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    await apiRegister(input);
    setUser(await getMe());
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (input: ProfileUpdateInput) => {
    const updated = await apiUpdateProfile(input);
    setUser(updated);
    return updated;
  }, []);

  const refresh = useCallback(async () => {
    try {
      setUser(await getMe());
    } catch {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile, refresh }),
    [user, loading, login, register, logout, updateProfile, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
