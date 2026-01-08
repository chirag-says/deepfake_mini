import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

// API base URL - use environment variable or default to localhost
// API base URL - ensure no trailing slash
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? "" : "http://localhost:8000");
const API_BASE_URL = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

// User storage key (we only store user data now, not the token)
// Token is stored in HttpOnly cookie by the backend
const USER_KEY = "defraudai_user";

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Verify auth status on mount by checking with the server.
   * 
   * SECURITY: We no longer rely on sessionStorage for auth state.
   * Instead, we verify with the server using the HttpOnly cookie.
   * This prevents XSS attacks from stealing tokens.
   */
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Try to get user info using the HttpOnly cookie
        const response = await fetch(`${API_BASE_URL}/api/me`, {
          credentials: "include", // CRITICAL: Include cookies in request
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsLoggedIn(true);
          // Cache user data for faster subsequent loads
          sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
        } else {
          // Cookie invalid or expired
          setUser(null);
          setIsLoggedIn(false);
          sessionStorage.removeItem(USER_KEY);
        }
      } catch (error) {
        // Network error - try cached user data for offline support
        const cachedUser = sessionStorage.getItem(USER_KEY);
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
            setIsLoggedIn(true);
          } catch {
            sessionStorage.removeItem(USER_KEY);
          }
        }
        console.error("Auth verification failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  /**
   * Make an authenticated API request.
   * 
   * SECURITY: Uses credentials: 'include' to send HttpOnly cookies.
   * No token is exposed to JavaScript - completely XSS-proof.
   */
  const authFetch = useCallback(async (endpoint, options = {}) => {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // CRITICAL: Include cookies in request
    });

    // Handle 401 - session expired or invalid
    if (response.status === 401) {
      setUser(null);
      setIsLoggedIn(false);
      sessionStorage.removeItem(USER_KEY);
      throw new Error("Session expired. Please log in again.");
    }

    return response;
  }, []);

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
        credentials: "include", // CRITICAL: Allow cookie to be set
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.detail || "Registration failed"
        };
      }

      // Store user data for quick access (token is in HttpOnly cookie)
      sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));

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
   * Login with email and password.
   * 
   * SECURITY: The backend sets an HttpOnly cookie with the JWT.
   * JavaScript never sees or stores the actual token.
   */
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // CRITICAL: Allow cookie to be set
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.detail || "Invalid email or password"
        };
      }

      // Store user data for quick access (token is in HttpOnly cookie)
      sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));

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
   * Logout - clear all auth state and call backend to clear cookie.
   * 
   * SECURITY: The backend clears the HttpOnly cookie.
   */
  const logout = useCallback(async () => {
    try {
      // Call backend to clear the HttpOnly cookie
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    // Clear local state regardless of backend response
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  /**
   * Refresh user data from the server
   */
  const refreshUser = useCallback(async () => {
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
  }, [authFetch]);

  const value = useMemo(
    () => ({
      isLoggedIn,
      isLoading,
      user,
      login,
      logout,
      register,
      authFetch,
      refreshUser,
    }),
    [isLoggedIn, isLoading, user, logout, authFetch, refreshUser]
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
