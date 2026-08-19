import React, { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert as RNAlert, ActivityIndicator,
} from 'react-native';
import { createAlert, createDevice } from '../services/api';
import { CreateAlertPayload, CreateDevicePayload } from '../types';

export default function SettingsScreen() {
  // Register beacon
  const [beaconName, setBeaconName] = useState('');
  const [beaconSerial, setBeaconSerial] = useState('');
  const [beaconLat, setBeaconLat] = useState('');
  const [beaconLon, setBeaconLon] = useState('');
  const [savingBeacon, setSavingBeacon] = useState(false);

  // Manual SOS
  const [sosDeviceId, setSosDeviceId] = useState('');
  const [sosDesc, setSosDesc] = useState('');
  const [sendingSos, setSendingSos] = useState(false);

  const handleRegisterBeacon = async () => {
    if (!beaconName.trim() || !beaconSerial.trim()) {
      RNAlert.alert('Erro', 'Nome e número de série são obrigatórios.');
      return;
    }
    setSavingBeacon(true);
    try {
      const payload: CreateDevicePayload = {
        name: beaconName.trim(),
        serialNumber: beaconSerial.trim(),
        latitude: beaconLat ? parseFloat(beaconLat) : undefined,
        longitude: beaconLon ? parseFloat(beaconLon) : undefined,
      };
      await createDevice(payload);
      RNAlert.alert('Sucesso', 'Beacon registrado com sucesso!');
      setBeaconName('');
      setBeaconSerial('');
      setBeaconLat('');
      setBeaconLon('');
    } catch (e: any) {
      RNAlert.alert('Erro', e?.response?.data?.message ?? 'Falha ao registrar beacon.');
    } finally {
      setSavingBeacon(false);
    }
  };

  const handleManualSOS = async () => {
    if (!sosDeviceId.trim()) {
      RNAlert.alert('Erro', 'Informe o ID do dispositivo.');
      return;
    }
    setSendingSos(true);
    try {
      const payload: CreateAlertPayload = {
        deviceId: parseInt(sosDeviceId),
        type: 'SOS_BUTTON',
        riskLevel: 'CRITICAL',
        description: sosDesc.trim() || 'SOS manual acionado pelo operador.',
      };
      await createAlert(payload);
      RNAlert.alert('SOS Enviado', 'Alerta de emergência criado com sucesso.');
      setSosDeviceId('');
      setSosDesc('');
    } catch (e: any) {
      RNAlert.alert('Erro', e?.response?.data?.message ?? 'Falha ao enviar SOS.');
    } finally {
      setSendingSos(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Register Beacon */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📡 Cadastrar Beacon</Text>

        <Text style={styles.label}>Nome do dispositivo *</Text>
        <TextInput
          style={styles.input}
          value={beaconName}
          onChangeText={setBeaconName}
          placeholder="ex: Beacon Alpha - Serra do Mar"
          placeholderTextColor="#4b5563"
        />

        <Text style={styles.label}>Número de série *</Text>
        <TextInput
          style={styles.input}
          value={beaconSerial}
          onChangeText={setBeaconSerial}
          placeholder="ex: PLB-004-DELTA"
          placeholderTextColor="#4b5563"
          autoCapitalize="characters"
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Latitude</Text>
            <TextInput
              style={styles.input}
              value={beaconLat}
              onChangeText={setBeaconLat}
              placeholder="-23.9955"
              placeholderTextColor="#4b5563"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.half, { marginLeft: 8 }]}>
            <Text style={styles.label}>Longitude</Text>
            <TextInput
              style={styles.input}
              value={beaconLon}
              onChangeText={setBeaconLon}
              placeholder="-46.3051"
              placeholderTextColor="#4b5563"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, savingBeacon && styles.btnDisabled]}
          onPress={handleRegisterBeacon}
          disabled={savingBeacon}
        >
          {savingBeacon ? (
            <ActivityIndicator color="#0a0f1e" />
          ) : (
            <Text style={styles.btnText}>Registrar Beacon</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Manual SOS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🆘 Emitir SOS Manual</Text>

        <Text style={styles.label}>ID do dispositivo *</Text>
        <TextInput
          style={styles.input}
          value={sosDeviceId}
          onChangeText={setSosDeviceId}
          placeholder="ex: 1"
          placeholderTextColor="#4b5563"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Descrição (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={sosDesc}
          onChangeText={setSosDesc}
          placeholder="Descreva a emergência..."
          placeholderTextColor="#4b5563"
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.btn, styles.btnDanger, sendingSos && styles.btnDisabled]}
          onPress={handleManualSOS}
          disabled={sendingSos}
        >
          {sendingSos ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>🆘 Enviar SOS</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* API Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Informações do Sistema</Text>
        <Text style={styles.infoText}>API Backend: http://localhost:8080</Text>
        <Text style={styles.infoText}>H2 Console: http://localhost:8080/h2-console</Text>
        <Text style={styles.infoText}>Saúde: http://localhost:8080/actuator/health</Text>
        <Text style={styles.infoText}>Versão: 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  content: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  sectionTitle: { color: '#00d4ff', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  label: { color: '#9ca3af', fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  half: { flex: 1 },
  btn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  btnPrimary: { backgroundColor: '#00d4ff' },
  btnDanger: { backgroundColor: '#dc2626' },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontWeight: '700', fontSize: 15, color: '#0a0f1e' },
  infoText: { color: '#6b7280', fontSize: 13, marginBottom: 4 },
});
