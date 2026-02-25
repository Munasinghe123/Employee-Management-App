import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

type Substation = {
  substationId: string;
  name: string;
  latitude: string;
  longitude: string;
};

type User = {
  userName: string;
  name: string;
  employeeId: string;
  role: string;
  expIn: number;
  substation: Substation;
};

type JwtPayload = User & {
  exp: number;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const decodeAndSetUser = (token: string) => {
    const decoded = jwtDecode<JwtPayload>(token);
    setUser({
      userName: decoded.userName,
      substation: decoded.substation,
      name: decoded.name,
      employeeId: decoded.employeeId,
      role: decoded.role,
      expIn: decoded.exp,
    });
    console.log('Decoded JWT Payload:', decoded);
  };

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          decodeAndSetUser(storedToken);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (token: string) => {
    setToken(token);
    decodeAndSetUser(token);
    await AsyncStorage.setItem('token', token);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}