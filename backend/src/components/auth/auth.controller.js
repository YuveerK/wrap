import * as authService from "./auth.service.js";
import { AppError } from "../../libraries/errors.js";
import {
  verificationErrorPage,
  verificationSuccessPage,
} from "../../libraries/email-pages.js";

const REFRESH_COOKIE = "refreshToken";

function getRefreshToken(req) {
  return req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
}
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

export async function verifyEmail(req, res, next) {
  try {
    await authService.verifyEmail(req.params.token);
    const wantsJson =
      req.headers.accept?.includes("application/json") &&
      !req.headers.accept?.includes("text/html");
    if (wantsJson) {
      return res.json({ message: "Email verified successfully. You can now log in." });
    }
    return res.status(200).type("html").send(verificationSuccessPage());
  } catch (err) {
    if (err instanceof AppError && err.isOperational) {
      const wantsJson =
        req.headers.accept?.includes("application/json") &&
        !req.headers.accept?.includes("text/html");
      if (wantsJson) {
        return res.status(err.status).json({
          error: { code: err.code, message: err.message },
        });
      }
      return res.status(err.status).type("html").send(verificationErrorPage(err.message));
    }
    next(err);
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.login(email, password);
  res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
  res.json({ accessToken, refreshToken, user });
}

export async function me(req, res) {
  const user = await authService.getMe(req.user.sub);
  res.json({ user });
}

export async function refresh(req, res) {
  const token = getRefreshToken(req);
  const { accessToken, refreshToken } = await authService.refresh(token);
  res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
  res.json({ accessToken, refreshToken });
}

export async function logout(req, res) {
  const token = getRefreshToken(req);
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
