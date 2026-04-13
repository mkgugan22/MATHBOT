import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

const SESSION_USER_KEY  = 'mathbot_session_user';
const PERSISTENT_DB_KEY = 'mathbot_users_db';
const SESSION_DB_KEY    = 'mathbot_session_db';

async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function lsGet(k)    { try { const r = localStorage.getItem(k);   return r ? JSON.parse(r) : null; } catch { return null; } }
function lsSet(k, v) { try { v != null ? localStorage.setItem(k, JSON.stringify(v)) : localStorage.removeItem(k); } catch {} }
function ssGet(k)    { try { const r = sessionStorage.getItem(k); return r ? JSON.parse(r) : null; } catch { return null; } }
function ssSet(k, v) { try { v != null ? sessionStorage.setItem(k, JSON.stringify(v)) : sessionStorage.removeItem(k); } catch {} }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => ssGet(SESSION_USER_KEY));

  useEffect(() => {
    ssSet(SESSION_DB_KEY, ssGet(SESSION_DB_KEY) || {});
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    const sDb = ssGet(SESSION_DB_KEY) ?? {};
    const pDb = lsGet(PERSISTENT_DB_KEY) ?? {};
    const key = email.toLowerCase().trim();
    if (sDb[key] || pDb[key]) throw new Error('An account with this email already exists.');
    const hash = await hashPassword(password);
    const id   = 'user_' + Date.now();
    const safe = { id, name: name.trim(), email: key, avatar: name.trim()[0].toUpperCase(), createdAt: new Date().toISOString() };
    sDb[key] = { ...safe, _pwHash: hash };
    ssSet(SESSION_DB_KEY, sDb);
    pDb[key] = safe;
    lsSet(PERSISTENT_DB_KEY, pDb);
    setUser(safe);
    ssSet(SESSION_USER_KEY, safe);
    return safe;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const sDb = ssGet(SESSION_DB_KEY) ?? {};
    const pDb = lsGet(PERSISTENT_DB_KEY) ?? {};
    const key = email.toLowerCase().trim();
    const pu  = pDb[key];
    if (!pu) throw new Error('No account found with this email.');
    const hash = await hashPassword(password);
    let found  = sDb[key];
    if (!found) {
      found = { ...pu, _pwHash: hash };
      sDb[key] = found;
      ssSet(SESSION_DB_KEY, sDb);
    } else if (found._pwHash !== hash) {
      throw new Error('Incorrect password. Please try again.');
    }
    const { _pwHash, ...safe } = found;
    setUser(safe);
    ssSet(SESSION_USER_KEY, safe);
    return safe;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    ssSet(SESSION_USER_KEY, null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}