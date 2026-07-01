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

export interface MfaFactor {
  id: string;
  type: string;
  friendlyName: string | null;
  status: string;
  createdAt: string | null;
}

export interface MfaChallenge {
  accessToken: string;
  factors: MfaFactor[];
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
  login: (
    email: string,
    password: string
  ) => Promise<{ error?: string; mfa?: MfaChallenge }>;
  register: (payload: RegisterPayload) => Promise<{ error?: string }>;
  verifyMfaLogin: (
    challenge: MfaChallenge,
    factorId: string,
    code: string
  ) => Promise<{ error?: string }>;
  loginWithGoogle: (role: UserRole) => Promise<{ error?: string }>;
  completeOAuthLogin: (
    accessToken: string,
    role: UserRole
  ) => Promise<{ error?: string; mfa?: MfaChallenge }>;
  applySessionToken: (token: string) => Promise<void>;
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
    const token = localStorage.getItem("ls_token");
    if (!token) return;
    await fetchMe(token);
  }

  async function applySessionToken(token: string) {
    setStoredToken(token);
    await fetchMe(token);
  }

  function getMfaChallenge(data: any): MfaChallenge | null {
    const accessToken = data.tempSession?.access_token;
    const factors = data.mfa?.factors;

    if (!data.requiresMfa || !accessToken || !Array.isArray(factors)) {
      return null;
    }

    return {
      accessToken,
      factors,
    };
  }

  async function login(email: string, password: string) {
    try {
      const { data } = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const mfa = getMfaChallenge(data);
      if (mfa) return { mfa };

      const token = data.session?.access_token;
      if (!token) return { error: "Ni veljavnega tokena" };

      await applySessionToken(token);
      return {};
    } catch (error) {
      return { error: getApiErrorMessage(error, "Streznik ni dosegljiv") };
    }
  }

  async function verifyMfaLogin(
    challenge: MfaChallenge,
    factorId: string,
    code: string
  ) {
    try {
      const { data } = await api.post(
        "/auth/mfa/login-verify",
        { factorId, code },
        {
          headers: {
            Authorization: `Bearer ${challenge.accessToken}`,
          },
        }
      );

      const token = data.session?.access_token;
      if (!token) return { error: "Ni veljavnega tokena po 2FA preverjanju" };

      await applySessionToken(token);
      return {};
    } catch (error) {
      return { error: getApiErrorMessage(error, "Napačna 2FA koda") };
    }
  }

  async function loginWithGoogle(role: UserRole) {
    try {
      const { data } = await api.get("/auth/google/url", {
        params: { role },
      });

      if (!data.url) return { error: "Google prijava ni na voljo" };
      window.location.assign(data.url);
      return {};
    } catch (error) {
      return { error: getApiErrorMessage(error, "Google prijava ni uspela") };
    }
  }

  async function completeOAuthLogin(accessToken: string, role: UserRole) {
    try {
      const { data } = await api.post(
        "/auth/oauth/complete",
        { role },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const mfa = getMfaChallenge(data);
      if (mfa) return { mfa };

      const token = data.session?.access_token || accessToken;
      await applySessionToken(token);
      return {};
    } catch (error) {
      return { error: getApiErrorMessage(error, "Google prijava ni uspela") };
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
      return {};
    } catch (error) {
      return { error: getApiErrorMessage(error, "Napaka pri registraciji") };
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
        verifyMfaLogin,
        loginWithGoogle,
        completeOAuthLogin,
        applySessionToken,
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
