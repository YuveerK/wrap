import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiClient } from '@/api/client';

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
    await Notifications.setNotificationChannelAsync('safety', {
      name: 'Safety Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    console.warn('[notifications] No EAS project ID configured in app.json extra.eas.projectId');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  return token;
}

export async function syncPushToken() {
  try {
    const token = await registerForPushNotificationsAsync();
    if (!token) return;
    await apiClient.post('/notifications/token', { token });
  } catch (e) {
    console.warn('[notifications] Token sync failed', e?.message);
  }
}
