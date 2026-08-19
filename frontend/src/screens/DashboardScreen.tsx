import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { getActiveAlertsCount, getDevices } from '../services/api';
import { Device } from '../types';
import BeaconCard from '../components/BeaconCard';

export default function DashboardScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [devs, count] = await Promise.all([getDevices(), getActiveAlertsCount()]);
      setDevices(devs);
      setActiveAlerts(count);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, []);

  const online = devices.filter(d => d.status === 'ONLINE').length;
  const emergency = devices.filter(d => d.status === 'EMERGENCY').length;
  const offline = devices.filter(d => d.status === 'OFFLINE').length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={styles.loadingText}>Conectando ao sistema...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🛰️ PulseLink Beacon</Text>
        <Text style={styles.subtitle}>Sistema de Monitoramento</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: '#10b981' }]}>
          <Text style={[styles.summaryNum, { color: '#10b981' }]}>{online}</Text>
          <Text style={styles.summaryLabel}>Online</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#ef4444' }]}>
          <Text style={[styles.summaryNum, { color: '#ef4444' }]}>{emergency}</Text>
          <Text style={styles.summaryLabel}>Emergência</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#6b7280' }]}>
          <Text style={[styles.summaryNum, { color: '#6b7280' }]}>{offline}</Text>
          <Text style={styles.summaryLabel}>Offline</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#f59e0b' }]}>
          <Text style={[styles.summaryNum, { color: '#f59e0b' }]}>{activeAlerts}</Text>
          <Text style={styles.summaryLabel}>Alertas</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Dispositivos Beacons</Text>
      {devices.length === 0 ? (
        <Text style={styles.empty}>Nenhum dispositivo registrado.</Text>
      ) : (
        devices.map(d => <BeaconCard key={d.id} device={d} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0f1e' },
  loadingText: { color: '#9ca3af', marginTop: 12 },
  header: { marginBottom: 20, marginTop: 8 },
  title: { color: '#00d4ff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#6b7280', fontSize: 13 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  summaryNum: { fontSize: 24, fontWeight: '800' },
  summaryLabel: { color: '#9ca3af', fontSize: 11, marginTop: 2 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  empty: { color: '#4b5563', textAlign: 'center', marginTop: 20 },
});
