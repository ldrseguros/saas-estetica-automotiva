import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "TENANT_ADMIN" | "EMPLOYEE" | "CLIENT";
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = () => {
      try {
        const token = sessionStorage.getItem("token");
        const userStr = sessionStorage.getItem("user");

        if (token && userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error parsing user data from sessionStorage:", error);
        setUser(null);
        // Clear invalid data
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token") {
        checkAuthState();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
};
