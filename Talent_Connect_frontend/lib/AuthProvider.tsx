"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  role: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  role: string;
  loading: boolean;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "",
  loading: true,
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const role = user?.role || "";

  return (
    <AuthContext.Provider value={{ user, role, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
