import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { getAlerts, getDevices } from '../services/api';
import { Alert, Device } from '../types';

export default function MapScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [devs, als] = await Promise.all([getDevices(), getAlerts('active')]);
      setDevices(devs.filter(d => d.latitude && d.longitude));
      setAlerts(als.filter(a => a.latitude && a.longitude));
    } catch (e) {
      console.error('Map load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  // Centre on Brazil
  const initialRegion = {
    latitude: -14.235,
    longitude: -51.9253,
    latitudeDelta: 30,
    longitudeDelta: 30,
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        mapType="satellite"
      >
        {devices.map(d => (
          <Marker
            key={`device-${d.id}`}
            coordinate={{ latitude: d.latitude!, longitude: d.longitude! }}
            pinColor={
              d.status === 'EMERGENCY' ? 'red' :
              d.status === 'ONLINE' ? '#00d4ff' :
              'gray'
            }
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{d.name}</Text>
                <Text>Status: {d.status}</Text>
                <Text>Bateria: {d.batteryLevel}%</Text>
                <Text>Satélite: {d.satelliteConnected ? 'Sim' : 'Não'}</Text>
              </View>
            </Callout>
          </Marker>
        ))}

        {alerts.map(a => (
          <Marker
            key={`alert-${a.id}`}
            coordinate={{ latitude: a.latitude!, longitude: a.longitude! }}
            pinColor="orange"
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>⚠️ {a.type.replace('_', ' ')}</Text>
                <Text>{a.deviceName}</Text>
                <Text>Risco: {a.riskLevel}</Text>
                <Text>{a.description}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legenda</Text>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: '#00d4ff' }]} />
          <Text style={styles.legendText}>Beacon Online</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: 'red' }]} />
          <Text style={styles.legendText}>Emergência</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: 'orange' }]} />
          <Text style={styles.legendText}>Alerta Ativo</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: 'gray' }]} />
          <Text style={styles.legendText}>Offline</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.refreshBtn} onPress={load}>
        <Text style={styles.refreshText}>↻ Atualizar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0f1e' },
  loadingText: { color: '#9ca3af', marginTop: 12 },
  callout: { padding: 8, minWidth: 160 },
  calloutTitle: { fontWeight: 'bold', marginBottom: 4 },
  legend: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(17,24,39,0.92)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  legendTitle: { color: '#fff', fontWeight: '700', marginBottom: 6, fontSize: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { color: '#d1d5db', fontSize: 11 },
  refreshBtn: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#00d4ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshText: { color: '#0a0f1e', fontWeight: '700' },
});
