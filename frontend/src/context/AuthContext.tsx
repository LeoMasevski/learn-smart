import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  api,
  clearStoredToken,
  getApiErrorMessage,
  getStoredToken,
  setStoredToken,
} from "../api/api";

export type UserRole = "STUDENT" | "PROFESSOR";

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  learning_type?: "VISUAL" | "AUDITORY" | "KINESTHETIC" | null;
}

interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  token: string | null;
  isLoading: boolean;
}

interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    token: getStoredToken(),
    isLoading: true,
  });

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    fetchMe(token);

    const handleAuthExpired = () => {
      setState({ user: null, profile: null, token: null, isLoading: false });
    };

    window.addEventListener("learnsmart:auth-expired", handleAuthExpired);
    return () => window.removeEventListener("learnsmart:auth-expired", handleAuthExpired);
  }, []);

  async function fetchMe(token: string) {
    try {
      const { data } = await api.get("/auth/me");
      setState({
        user: data.user,
        profile: data.profile,
        token,
        isLoading: false,
      });
    } catch {
      clearStoredToken();
      setState({ user: null, profile: null, token: null, isLoading: false });
    }
  }

  async function refreshProfile() {
    const token = getStoredToken();
    if (!token) {
      setState({ user: null, profile: null, token: null, isLoading: false });
      return;
    }

    await fetchMe(token);
  }

  async function login(email: string, password: string) {
    try {
      const { data } = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const token = data.session?.access_token;
      if (!token) return { error: "Ni veljavnega tokena" };

      setStoredToken(token);
      await fetchMe(token);
      return {};
    } catch (error) {
      return { error: getApiErrorMessage(error, "Streznik ni dosegljiv") };
    }
  }

  async function register({ email, password, fullName, role }: RegisterPayload) {
    try {
      const normalizedEmail = email.trim().toLowerCase();

      await api.post("/auth/register", {
        email: normalizedEmail,
        password,
        fullName: fullName.trim(),
        role,
      });

      return await login(normalizedEmail, password);
    } catch (error) {
      return { error: getApiErrorMessage(error, "Streznik ni dosegljiv") };
    }
  }

  function logout() {
    clearStoredToken();
    setState({ user: null, profile: null, token: null, isLoading: false });
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        refreshProfile,
        logout,
        isAuthenticated: !!state.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
