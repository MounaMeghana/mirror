/**
 * AuthContext.jsx — Global authentication state
 *
 * This is a React Context — think of it as a "global variable" that any
 * component in the app can read, without passing props down through every layer.
 *
 * It stores:
 *   - user: { id, username } — the logged-in user's basic info
 *   - token: the JWT string — sent with API requests to prove identity
 *
 * It also provides:
 *   - login(tokenData) — saves to context AND localStorage (survives page refresh)
 *   - logout()         — clears everything
 *
 * HOW LOCALSTORAGE WORKS:
 *   localStorage is a small key-value store in the browser.
 *   Data persists even after you close and reopen the browser tab.
 *   We use it to keep the user logged in between page refreshes.
 *
 *   localStorage.setItem("token", "eyJ...")   ← save
 *   localStorage.getItem("token")             ← read
 *   localStorage.removeItem("token")          ← delete
 */

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // On page load, check if a token was already saved in localStorage
  const [token, setToken] = useState(() => localStorage.getItem('eunoia_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('eunoia_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (tokenData) => {
    // tokenData looks like: { access_token, user_id, username }
    const userInfo = { id: tokenData.user_id, username: tokenData.username };
    
    // Save to state (makes React re-render)
    setToken(tokenData.access_token);
    setUser(userInfo);
    
    // Save to localStorage (survives page refresh)
    localStorage.setItem('eunoia_token', tokenData.access_token);
    localStorage.setItem('eunoia_user', JSON.stringify(userInfo));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('eunoia_token');
    localStorage.removeItem('eunoia_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — makes it easy to use the context in any component:
//   const { user, token, login, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
