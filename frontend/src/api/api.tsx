import axios from "axios";

const tokenStorageKey = "ls_token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 30_000,
});

export function getStoredToken() {
  return localStorage.getItem(tokenStorageKey);
}

export function setStoredToken(token: string) {
  localStorage.setItem(tokenStorageKey, token);
}

export function clearStoredToken() {
  localStorage.removeItem(tokenStorageKey);
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    return typeof message === "string" && message.trim() ? message : fallback;
  }

  return fallback;
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearStoredToken();
      window.dispatchEvent(new Event("learnsmart:auth-expired"));
    }

    return Promise.reject(error);
  }
);
