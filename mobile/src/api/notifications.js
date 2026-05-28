import { apiClient } from './client';

export const registerPushToken = (token) =>
  apiClient.post('/notifications/token', { token });
