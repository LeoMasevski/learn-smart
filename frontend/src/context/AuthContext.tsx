import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export type UserRole = "STUDENT" | "PROFESSOR";

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  learning_type?: "visual" | "auditory" | "kinesthetic" | null;
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
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    token: localStorage.getItem("ls_token"),
    isLoading: true,
  });

  // Ob zagonu preveri token in naloži profil
  useEffect(() => {
    const token = localStorage.getItem("ls_token");
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    fetchMe(token);
  }, []);

  async function fetchMe(token: string) {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Invalid token");
      const data = await res.json();
      setState({
        user: data.user,
        profile: data.profile,
        token,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem("ls_token");
      setState({ user: null, profile: null, token: null, isLoading: false });
    }
  }

  async function login(email: string, password: string) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || data.message || "Napaka pri prijavi" };

      const token = data.session?.access_token;
      if (!token) return { error: "Ni veljavnega tokena" };

      localStorage.setItem("ls_token", token);
      await fetchMe(token);
      return {};
    } catch {
      return { error: "Strežnik ni dosegljiv" };
    }
  }

  async function register({ email, password, fullName, role }: RegisterPayload) {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, role }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || data.message || "Napaka pri registraciji" };

      // Po registraciji avtomatska prijava
      return await login(email, password);
    } catch {
      return { error: "Strežnik ni dosegljiv" };
    }
  }

  function logout() {
    localStorage.removeItem("ls_token");
    setState({ user: null, profile: null, token: null, isLoading: false });
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
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
  if (!ctx) throw new Error("useAuth mora biti znotraj AuthProvider");
  return ctx;
}