import axios from 'axios';
import { Alert, CreateAlertPayload, CreateDevicePayload, Device, SensorReading } from '../types';
import { getToken, logout } from './auth';

// Change to your machine's local IP when testing on a physical device
const BASE_URL = 'http://10.0.2.2:8080/api'; // Android emulator → localhost
// const BASE_URL = 'http://localhost:8080/api'; // iOS simulator

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor — attach JWT token ───────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await logout();
      // The AppNavigator will detect the logout and show LoginScreen
    }
    return Promise.reject(error);
  }
);

// ── Devices ──────────────────────────────────────────────────────────────────

export const getDevices = (): Promise<Device[]> =>
  api.get<Device[]>('/devices').then(r => r.data);

export const getDevice = (id: number): Promise<Device> =>
  api.get<Device>(`/devices/${id}`).then(r => r.data);

export const createDevice = (payload: CreateDevicePayload): Promise<Device> =>
  api.post<Device>('/devices', payload).then(r => r.data);

export const updateDevice = (id: number, payload: Partial<CreateDevicePayload>): Promise<Device> =>
  api.put<Device>(`/devices/${id}`, payload).then(r => r.data);

export const deactivateDevice = (id: number): Promise<void> =>
  api.delete(`/devices/${id}`).then(() => undefined);

// ── Alerts ───────────────────────────────────────────────────────────────────

export const getAlerts = (status?: 'active'): Promise<Alert[]> =>
  api.get<Alert[]>('/alerts', { params: status ? { status } : undefined }).then(r => r.data);

export const getAlert = (id: number): Promise<Alert> =>
  api.get<Alert>(`/alerts/${id}`).then(r => r.data);

export const getAlertsByDevice = (deviceId: number): Promise<Alert[]> =>
  api.get<Alert[]>(`/alerts/device/${deviceId}`).then(r => r.data);

export const createAlert = (payload: CreateAlertPayload): Promise<Alert> =>
  api.post<Alert>('/alerts', payload).then(r => r.data);

export const acknowledgeAlert = (id: number): Promise<Alert> =>
  api.patch<Alert>(`/alerts/${id}/acknowledge`).then(r => r.data);

export const resolveAlert = (id: number): Promise<Alert> =>
  api.patch<Alert>(`/alerts/${id}/resolve`).then(r => r.data);

export const getActiveAlertsCount = (): Promise<number> =>
  api.get<{ activeAlerts: number }>('/alerts/count/active').then(r => r.data.activeAlerts);

// ── Sensor Readings ───────────────────────────────────────────────────────────

export const getLatestReadings = (): Promise<SensorReading[]> =>
  api.get<SensorReading[]>('/sensors/readings/latest').then(r => r.data);

export const getReadingsByDevice = (deviceId: number): Promise<SensorReading[]> =>
  api.get<SensorReading[]>('/sensors/readings', { params: { deviceId } }).then(r => r.data);

export default api;
