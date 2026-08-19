import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Device, DeviceStatus } from '../types';

const STATUS_CONFIG: Record<DeviceStatus, { color: string; label: string }> = {
  ONLINE: { color: '#10b981', label: 'Online' },
  OFFLINE: { color: '#6b7280', label: 'Offline' },
  EMERGENCY: { color: '#ef4444', label: 'Emergência' },
  LOW_BATTERY: { color: '#f59e0b', label: 'Bateria Baixa' },
};

interface Props {
  device: Device;
}

export default function BeaconCard({ device }: Props) {
  const config = STATUS_CONFIG[device.status];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.statusDot, { backgroundColor: config.color }]} />
        <Text style={styles.name} numberOfLines={1}>{device.name}</Text>
      </View>

      <Text style={styles.serial}>{device.serialNumber}</Text>

      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={[styles.statValue, { color: config.color }]}>{config.label}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Bateria</Text>
          <Text style={[styles.statValue, { color: device.batteryLevel <= 20 ? '#ef4444' : '#10b981' }]}>
            {device.batteryLevel}%
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Satélite</Text>
          <Text style={[styles.statValue, { color: device.satelliteConnected ? '#10b981' : '#6b7280' }]}>
            {device.satelliteConnected ? 'Conectado' : 'Offline'}
          </Text>
        </View>
      </View>

      {device.latitude && device.longitude && (
        <Text style={styles.coords}>
          📍 {device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}
        </Text>
      )}

      {device.lastSeen && (
        <Text style={styles.lastSeen}>
          Último sinal: {new Date(device.lastSeen).toLocaleString('pt-BR')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#00d4ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  serial: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  coords: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  lastSeen: {
    color: '#4b5563',
    fontSize: 11,
    marginTop: 4,
  },
});
