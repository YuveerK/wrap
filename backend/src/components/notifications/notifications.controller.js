import * as service from './notifications.service.js';

export async function registerToken(req, res, next) {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        error: { code: 'MISSING_TOKEN', message: 'token is required' },
      });
    }
    const platform = token.startsWith('ExponentPushToken') ? 'expo' : 'device';
    await service.registerToken(req.user.sub, token, platform);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}
