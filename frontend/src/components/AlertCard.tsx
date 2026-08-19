import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Alert, AlertType, RiskLevel } from '../types';

const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

const TYPE_ICONS: Record<AlertType, string> = {
  FIRE: '🔥',
  IMPACT: '💥',
  SOS_BUTTON: '🆘',
  HIGH_TEMPERATURE: '🌡️',
  LOW_BATTERY: '🔋',
  MANUAL: '📢',
};

interface Props {
  alert: Alert;
  onAcknowledge?: (id: number) => void;
  onResolve?: (id: number) => void;
}

export default function AlertCard({ alert, onAcknowledge, onResolve }: Props) {
  const riskColor = RISK_COLORS[alert.riskLevel];
  const icon = TYPE_ICONS[alert.type];

  return (
    <View style={[styles.card, { borderLeftColor: riskColor }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.titleBlock}>
          <Text style={styles.type}>{alert.type.replace('_', ' ')}</Text>
          <Text style={styles.device}>{alert.deviceName}</Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: riskColor + '33', borderColor: riskColor }]}>
          <Text style={[styles.riskText, { color: riskColor }]}>{alert.riskLevel}</Text>
        </View>
      </View>

      <Text style={styles.description}>{alert.description}</Text>

      {alert.latitude && alert.longitude && (
        <Text style={styles.coords}>
          📍 {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
        </Text>
      )}

      <Text style={styles.time}>
        {new Date(alert.createdAt).toLocaleString('pt-BR')}
      </Text>

      {alert.status === 'ACTIVE' && (
        <View style={styles.actions}>
          {onAcknowledge && (
            <TouchableOpacity
              style={[styles.btn, styles.btnAck]}
              onPress={() => onAcknowledge(alert.id)}
            >
              <Text style={styles.btnText}>Reconhecer</Text>
            </TouchableOpacity>
          )}
          {onResolve && (
            <TouchableOpacity
              style={[styles.btn, styles.btnResolve]}
              onPress={() => onResolve(alert.id)}
            >
              <Text style={styles.btnText}>Resolver</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {alert.status === 'ACKNOWLEDGED' && onResolve && (
        <TouchableOpacity
          style={[styles.btn, styles.btnResolve]}
          onPress={() => onResolve(alert.id)}
        >
          <Text style={styles.btnText}>Marcar Resolvido</Text>
        </TouchableOpacity>
      )}

      {alert.status === 'RESOLVED' && (
        <Text style={styles.resolved}>✅ Resolvido</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  titleBlock: {
    flex: 1,
  },
  type: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  device: {
    color: '#9ca3af',
    fontSize: 12,
  },
  riskBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    color: '#d1d5db',
    fontSize: 13,
    marginBottom: 6,
  },
  coords: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  time: {
    color: '#4b5563',
    fontSize: 11,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnAck: {
    backgroundColor: '#1d4ed8',
  },
  btnResolve: {
    backgroundColor: '#065f46',
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  resolved: {
    color: '#10b981',
    fontSize: 13,
  },
});
