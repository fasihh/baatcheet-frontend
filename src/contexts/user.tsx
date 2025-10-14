import React, { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface UserContextType {
  token: string | null;
  login: (token: string | null) => void;
  logout: () => void;
  getTokenPayload: () => any;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const storage = window.localStorage;

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(storage.getItem('authToken'));

  const login = (token: string | null) => {
    setToken(token);
    storage.setItem('authToken', token || '');
  }

  const logout = () => {
    setToken(null);
    storage.removeItem('authToken');
  }

  const getTokenPayload = () => {
    try {
      return jwtDecode(token!);
    } catch (e) {
      throw new Error('Invalid token');
    }
  }

  return (
    <UserContext.Provider value={{ token, login, logout, getTokenPayload }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};