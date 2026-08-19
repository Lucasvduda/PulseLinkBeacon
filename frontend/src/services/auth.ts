import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const TOKEN_KEY = '@pulselink_token';
const USER_KEY = '@pulselink_user';

export interface AuthUser {
  username: string;
  fullName: string;
  role: 'ADMIN' | 'OPERATOR';
}

export interface LoginResponse {
  token: string;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'OPERATOR';
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { username, password });
  const data = response.data;

  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify({
    username: data.username,
    fullName: data.fullName,
    role: data.role,
  }));

  return data;
};

export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};

export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

export const getUser = async (): Promise<AuthUser | null> => {
  const json = await AsyncStorage.getItem(USER_KEY);
  return json ? JSON.parse(json) : null;
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return token !== null;
};
