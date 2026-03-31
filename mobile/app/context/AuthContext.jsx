// mobile/app/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync("mah_user");
        if (stored) setUser(JSON.parse(stored));
      } catch (err) {
        console.warn("Failed to load stored user:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const data = await api.post("/api/auth/login", { email, password });
    await SecureStore.setItemAsync("mah_token", data.token);
    await SecureStore.setItemAsync("mah_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const data = await api.post("/api/auth/register", { name, email, password });
    await SecureStore.setItemAsync("mah_token", data.token);
    await SecureStore.setItemAsync("mah_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await SecureStore.deleteItemAsync("mah_token");
    await SecureStore.deleteItemAsync("mah_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
