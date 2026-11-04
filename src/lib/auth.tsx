import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { cancelAllReminders } from './notifications';
import { LEGACY_STATE_KEY, stateKeyFor } from './store';

// Accounts live only on this device; there is no backend to verify them against.
const ACCOUNTS_KEY = 'psr-accounts-v1';
const SESSION_KEY = 'psr-session-v1';
const HASH_ROUNDS = 500;

type StoredAccount = { name: string; email: string; salt: string; hash: string; createdAt: string };
export type User = { name: string; email: string };

type AuthContextValue = {
  ready: boolean;
  user: User | null;
  hasAccounts: boolean;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

const toHex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

async function hashPassword(password: string, salt: string) {
  let digest = `${salt}:${password}`;
  for (let i = 0; i < HASH_ROUNDS; i++) {
    digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${digest}`);
  }
  return digest;
}

async function loadAccounts(): Promise<Record<string, StoredAccount>> {
  const json = await AsyncStorage.getItem(ACCOUNTS_KEY);
  return json ? JSON.parse(json) : {};
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasAccounts, setHasAccounts] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const accounts = await loadAccounts();
        setHasAccounts(Object.keys(accounts).length > 0);
        const email = await AsyncStorage.getItem(SESSION_KEY);
        const account = email ? accounts[email] : undefined;
        if (account) setUser({ name: account.name, email: account.email });
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const signUp = useCallback(async ({ name, email, password }: { name: string; email: string; password: string }) => {
    const key = normalizeEmail(email);
    const accounts = await loadAccounts();
    if (accounts[key]) throw new Error('An account with this email already exists. Please sign in.');

    const salt = toHex(Crypto.getRandomBytes(16));
    const account: StoredAccount = {
      name: name.trim(),
      email: key,
      salt,
      hash: await hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    };

    // Data recorded before accounts existed belongs to the first account created.
    if (Object.keys(accounts).length === 0) {
      const legacy = await AsyncStorage.getItem(LEGACY_STATE_KEY);
      if (legacy) {
        await AsyncStorage.setItem(stateKeyFor(key), legacy);
        await AsyncStorage.removeItem(LEGACY_STATE_KEY);
      }
    }

    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify({ ...accounts, [key]: account }));
    await AsyncStorage.setItem(SESSION_KEY, key);
    setHasAccounts(true);
    setUser({ name: account.name, email: key });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const key = normalizeEmail(email);
    const account = (await loadAccounts())[key];
    if (!account || (await hashPassword(password, account.salt)) !== account.hash) {
      throw new Error('Email or password is incorrect.');
    }
    await AsyncStorage.setItem(SESSION_KEY, key);
    setUser({ name: account.name, email: key });
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    await cancelAllReminders();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ ready, user, hasAccounts, signUp, signIn, signOut }),
    [ready, user, hasAccounts, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
