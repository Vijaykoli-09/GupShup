import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList, SignUpData } from './shared';

// Emulator: http://10.0.2.2:8080
// Real phone over USB (after `adb reverse tcp:8080 tcp:8080`): http://localhost:8080
export const HOST = 'http://192.168.1.3:8080';
export const WS_URL = HOST.replace(/^http/, 'ws') + '/ws';

const TOKEN_KEY = 'gupshup_token';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// ---------- Token (kept in memory, saved in AsyncStorage) ----------
// AsyncStorage is not secure storage. Move to a keychain library before production.
let token: string | null = null;
export const getToken = () => token;
export const loadToken = async () => {
  token = await AsyncStorage.getItem(TOKEN_KEY);
  return token;
};
export const saveToken = async (t: string) => {
  token = t;
  await AsyncStorage.setItem(TOKEN_KEY, t);
};
export const clearToken = async () => {
  token = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
};

// ---------- Errors ----------
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export const errMsg = (e: unknown) =>
  e instanceof Error ? e.message : 'Something went wrong';

// ---------- Core request ----------
async function request<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(HOST + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check your connection.');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Expired or invalid session: clear it and go back to the welcome screen.
    if (res.status === 401 && auth && token) {
      await clearToken();
      if (navigationRef.isReady() && navigationRef.getCurrentRoute()?.name !== 'Splash') {
        navigationRef.reset({ index: 0, routes: [{ name: 'Welcome' }] });
      }
    }
    throw new ApiError(res.status, data.error || `Something went wrong (${res.status})`);
  }
  return data as T;
}

// ---------- Types ----------
export type Me = {
  publicUsername: string;
  firstName: string;
  city: string;
  maskedPhone: string;
  canChangeUsername: boolean;
  nextUsernameChangeAt: string | null;
  consentAccepted: boolean;
  requiredLegalVersion: string;
};

export type ChatMessage = {
  id: number;
  username: string;
  text: string;
  createdAt: string;
  replyToId: number | null;
  replyToUsername: string | null;
  replyToText: string | null;
};

// ---------- Endpoints ----------
export const authApi = {
  register: (d: SignUpData) =>
    request<{ message: string }>('/api/auth/register', 'POST', d, false),
  verifyOtp: (phone: string, otp: string) =>
    request<{ registrationToken: string }>('/api/auth/verify-otp', 'POST', { phone, otp }, false),
  setPasscode: (registrationToken: string, passcode: string) =>
    request<{ message: string }>('/api/auth/set-passcode', 'POST', { registrationToken, passcode }, false),
  login: (phone: string, passcode: string) =>
    request<{ accessToken: string; publicUsername: string }>(
      '/api/auth/login', 'POST', { phone, passcode }, false),
};

export const userApi = {
  me: () => request<Me>('/api/users/me'),
  changeUsername: () =>
    request<{ username: string; nextChangeAt: string }>('/api/users/me/username', 'POST'),
  acceptConsent: (version: string) =>
    request<{ message: string }>('/api/users/me/consent', 'POST', {
      version, privacyPolicy: true, communityGuidelines: true, terms: true,
    }),
};

export const chatApi = {
  messages: () => request<ChatMessage[]>('/api/chat/messages'),
  send: (text: string, replyToId: number | null) =>
    request<ChatMessage>('/api/chat/messages', 'POST', { text, replyToId }),
  remove: (id: number) => request<{ message: string }>(`/api/chat/messages/${id}`, 'DELETE'),
};