/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("auth");
    return saved
      ? JSON.parse(saved)
      : { token: null, refreshToken: null, user: null };
  });

  const login = (data) => {
    const authData = {
      token: data.token,
      refreshToken: data.refreshToken ?? null,
      user: data.user,
    };
    setAuth(authData);
    localStorage.setItem("auth", JSON.stringify(authData));
  };

  const logout = () => {
    setAuth({ token: null, refreshToken: null, user: null });
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);