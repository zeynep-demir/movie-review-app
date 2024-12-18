import React, { useState, useEffect, createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [watchlistUpdated, setWatchlistUpdated] = useState(false);

  const checkAuthStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsAuthenticated(!!token);
  };

  const login = async (token, callback) => {
    await AsyncStorage.setItem('token', token);
    setIsAuthenticated(true);
    if (callback) callback();
  };

  const logout = async (callback) => {
    await AsyncStorage.removeItem('token');
    setIsAuthenticated(false);
    setWatchlistUpdated(true);
    if (callback) callback();
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, watchlistUpdated, setWatchlistUpdated }}>
      {children}
    </AuthContext.Provider>
  );
};
