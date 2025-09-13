import { useState, useEffect, useCallback } from "react";

const TOKEN_STORAGE_KEY = "noteflow_jwt_token";

type User = {
  id: string;
  username: string;
} | null;

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Decode JWT payload helper
  const decodeToken = (jwt: string): User | null => {
    try {
      const base64Url = jwt.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      if (payload.sub && payload.username) {
        return { id: payload.sub, username: payload.username };
      }
      return null;
    } catch {
      return null;
    }
  };

  // Sync user state i=on token load/change
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    const decodedUser = decodeToken(token);
    if (decodedUser) {
      setUser(decodedUser);
    } else {
      // Invalid token - clear it
      setUser(null);
      setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
  }, [token]);

  // Save token helper
  const saveToken = (jwt: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_STORAGE_KEY, jwt);
    }
    setToken(jwt);
  };

  // Clear auth state helper
  const clearAuth = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setToken(null);
    setUser(null);
  };

  // Login API call
  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        throw new Error("Invalid credentials");
      }
      const data = await res.json();
      if (data.token) {
        saveToken(data.token);
      } else {
        throw new Error("Token not received");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Login failed");
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Signup API call
  const signup = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Signup failed");
      }
      // Signup success, can auto-login or prompt user
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, []);

  return {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };
}
