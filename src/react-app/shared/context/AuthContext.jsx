import { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (username, password) => {
    if (username === "c" && password === "p") {
      setIsLoggedIn(true);
      return { success: true };
    }
    return { success: false, message: "Invalid username or password" };
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const value = useMemo(() => ({ isLoggedIn, login, logout }), [isLoggedIn]);

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
