import * as repo from './notifications.repository.js';

export const registerToken = (userId, token, platform) =>
  repo.upsertToken(userId, token, platform ?? 'unknown');

export async function sendPushNotifications(userIds, { title, body, data }) {
  if (!userIds.length) return;
  const rows = await repo.getTokensForUsers(userIds);
  if (!rows.length) return;

  const messages = rows.map(({ token }) => ({
    to: token,
    title,
    body,
    data: data ?? {},
    sound: 'default',
  }));

  // Expo Push API accepts up to 100 messages per request
  const chunks = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  await Promise.allSettled(
    chunks.map((chunk) =>
      fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(chunk),
      }),
    ),
  );
}
