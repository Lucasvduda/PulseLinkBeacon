import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView, View, Text, StyleSheet,
  RefreshControl, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { acknowledgeAlert, getAlerts, resolveAlert } from '../services/api';
import { Alert, AlertStatus } from '../types';
import AlertCard from '../components/AlertCard';

const FILTERS: { label: string; value: AlertStatus | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Ativos', value: 'ACTIVE' },
  { label: 'Reconhecidos', value: 'ACKNOWLEDGED' },
  { label: 'Resolvidos', value: 'RESOLVED' },
];

export default function EmergenciesScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<AlertStatus | 'ALL'>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await getAlerts(filter === 'ACTIVE' ? 'active' : undefined);
      setAlerts(filter === 'ALL' ? data : data.filter(a => a.status === filter));
    } catch (e) {
      console.error('Emergencies load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [filter]);

  const handleAcknowledge = async (id: number) => {
    await acknowledgeAlert(id);
    load();
  };

  const handleResolve = async (id: number) => {
    await resolveAlert(id);
    load();
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterTab, filter === f.value && styles.filterTabActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#00d4ff" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />}
        >
          {alerts.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>Nenhuma emergência encontrada</Text>
            </View>
          ) : (
            alerts.map(a => (
              <AlertCard
                key={a.id}
                alert={a}
                onAcknowledge={handleAcknowledge}
                onResolve={handleResolve}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  filterBar: { paddingHorizontal: 16, paddingVertical: 12, maxHeight: 56 },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#111827',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  filterTabActive: { backgroundColor: '#00d4ff22', borderColor: '#00d4ff' },
  filterText: { color: '#9ca3af', fontSize: 13 },
  filterTextActive: { color: '#00d4ff', fontWeight: '600' },
  list: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#6b7280', fontSize: 15 },
});
