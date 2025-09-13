import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "../hooks/useAuth";

type AuthUser = { id: string; username: string } | null;

type AuthContextType = {
  user: AuthUser;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    signup,
    logout,
  } = useAuth();

  // Optional: delay rendering until hydration/auth ready to avoid UI flicker
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null; // or a spinner if desired
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to consume auth context safely
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
