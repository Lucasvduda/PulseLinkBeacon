// Shared TypeScript types — mirrors backend DTOs

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'EMERGENCY' | 'LOW_BATTERY';
export type AlertType = 'FIRE' | 'IMPACT' | 'SOS_BUTTON' | 'HIGH_TEMPERATURE' | 'LOW_BATTERY' | 'MANUAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UserRole = 'ADMIN' | 'OPERATOR';

export interface Device {
  id: number;
  name: string;
  serialNumber: string;
  status: DeviceStatus;
  batteryLevel: number;
  latitude: number | null;
  longitude: number | null;
  lastSeen: string | null;
  satelliteConnected: boolean;
  active: boolean;
  createdAt: string;
}

export interface Alert {
  id: number;
  deviceId: number;
  deviceName: string;
  type: AlertType;
  status: AlertStatus;
  riskLevel: RiskLevel;
  latitude: number | null;
  longitude: number | null;
  description: string;
  createdAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
}

export interface SensorReading {
  id: number;
  deviceId: number;
  deviceName: string;
  smokeDetected: boolean;
  impactDetected: boolean;
  temperatureCelsius: number | null;
  batteryLevel: number | null;
  latitude: number | null;
  longitude: number | null;
  satelliteConnected: boolean;
  signalStrength: number | null;
  timestamp: string;
}

export interface CreateDevicePayload {
  name: string;
  serialNumber: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateAlertPayload {
  deviceId: number;
  type: AlertType;
  riskLevel: RiskLevel;
  latitude?: number;
  longitude?: number;
  description?: string;
}

// ── Auth Types ────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  fullName: string;
  role: UserRole;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}
