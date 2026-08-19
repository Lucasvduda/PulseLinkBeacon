import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EmergenciesScreen from '../screens/EmergenciesScreen';
import MapScreen from '../screens/MapScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { isAuthenticated } from '../services/auth';

export type RootTabParamList = {
  Dashboard: undefined;
  Emergencies: undefined;
  Map: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const COLORS = {
  primary: '#00d4ff',
  background: '#0a0f1e',
  surface: '#111827',
  inactive: '#4b5563',
};

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const checkAuth = useCallback(async () => {
    const authenticated = await isAuthenticated();
    setIsLoggedIn(authenticated);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Loading state while checking auth
  if (isLoggedIn === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Not authenticated — show login
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // Authenticated — show main app
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
              Dashboard: focused ? 'pulse' : 'pulse-outline',
              Emergencies: focused ? 'warning' : 'warning-outline',
              Map: focused ? 'map' : 'map-outline',
              Settings: focused ? 'settings' : 'settings-outline',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.inactive,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: '#1f2937',
            paddingBottom: 4,
          },
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
        <Tab.Screen name="Emergencies" component={EmergenciesScreen} options={{ title: 'Emergências' }} />
        <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Mapa' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0f1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
