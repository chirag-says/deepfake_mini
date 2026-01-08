import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

// API base URL - use environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Token storage keys
const TOKEN_KEY = "defraudai_token";
const USER_KEY = "defraudai_user";

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    const storedUser = sessionStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (e) {
        // Invalid stored data, clear it
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Make an authenticated API request
   * Automatically includes the JWT token in headers
   */
  const authFetch = useCallback(async (endpoint, options = {}) => {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add Authorization header if we have a token
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 - token expired or invalid
    if (response.status === 401) {
      logout();
      throw new Error("Session expired. Please log in again.");
    }

    return response;
  }, [token]);

  /**
   * Register a new user account
   */
  const register = async (email, password, name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.detail || "Registration failed"
        };
      }

      // Store token securely in sessionStorage (cleared when browser closes)
      sessionStorage.setItem(TOKEN_KEY, data.access_token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));

      setToken(data.access_token);
      setUser(data.user);
      setIsLoggedIn(true);

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error.message || "Network error. Please try again."
      };
    }
  };

  /**
   * Login with email and password
   * Makes a real POST request to the backend /api/login endpoint
   */
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.detail || "Invalid email or password"
        };
      }

      // Store token securely in sessionStorage (cleared when browser closes)
      // For even better security, consider HttpOnly cookies set by the backend
      sessionStorage.setItem(TOKEN_KEY, data.access_token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));

      setToken(data.access_token);
      setUser(data.user);
      setIsLoggedIn(true);

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.message || "Network error. Please try again."
      };
    }
  };

  /**
   * Logout - clear all auth state and storage
   */
  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  /**
   * Refresh user data from the server
   */
  const refreshUser = useCallback(async () => {
    if (!token) return null;

    try {
      const response = await authFetch("/api/me");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
    return null;
  }, [token, authFetch]);

  const value = useMemo(
    () => ({
      isLoggedIn,
      isLoading,
      user,
      token,
      login,
      logout,
      register,
      authFetch,
      refreshUser,
    }),
    [isLoggedIn, isLoading, user, token, logout, authFetch, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
