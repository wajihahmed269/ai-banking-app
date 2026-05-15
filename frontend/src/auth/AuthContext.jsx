import { createContext, useContext, useMemo, useState } from 'react';
import {
  clearStoredUsername,
  getStoredUsername,
  setStoredUsername,
} from './session.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => getStoredUsername());

  const value = useMemo(
    () => ({
      username,
      isAuthenticated: Boolean(username),
      signIn(nextUsername) {
        setStoredUsername(nextUsername);
        setUsername(nextUsername);
      },
      signOut() {
        clearStoredUsername();
        setUsername(null);
      },
    }),
    [username]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
