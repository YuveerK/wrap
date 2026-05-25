import * as authService from "./auth.service.js";

const REFRESH_COOKIE = "refreshToken";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req, res) {
  const { email, phone, password, firstName, lastName, streetAddress, postalCode } = req.body;
  await authService.register({ email, phone, password, firstName, lastName, streetAddress, postalCode });
  res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
}

export async function verifyEmail(req, res) {
  await authService.verifyEmail(req.params.token);
  res.json({ message: "Email verified successfully. You can now log in." });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.login(email, password);
  res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
  res.json({ accessToken, user });
}

export async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  const { accessToken, refreshToken } = await authService.refresh(token);
  res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
  res.json({ accessToken });
}

export async function logout(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE);
  res.json({ message: "Logged out successfully." });
}

export async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body.email);
  res.json({ message: "If an account exists with that email, a reset link has been sent." });
}

export async function resetPassword(req, res) {
  await authService.resetPassword(req.params.token, req.body.password);
  res.json({ message: "Password reset successfully. Please log in with your new password." });
}
