import nodemailer from "nodemailer";
import { config } from "../config/index.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.gmail.user,
    pass: config.gmail.appPassword,
  },
});

export async function sendVerificationEmail(to, token) {
  const link = `${config.backendUrl}/api/auth/verify/${token}`;
  await transporter.sendMail({
    from: `"${config.appName}" <${config.gmail.user}>`,
    to,
    subject: `Verify your ${config.appName} account`,
    html: `
      <h2>Welcome to ${config.appName}!</h2>
      <p>Please verify your email address by clicking the link below.</p>
      <p>This link expires in 24 hours.</p>
      <a href="${link}" style="
        display:inline-block;padding:12px 24px;background:#2563eb;
        color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;
      ">Verify Email</a>
      <p>Or copy this link: ${link}</p>
    `,
  });
}

export async function sendPasswordResetEmail(to, token) {
  const link = `${config.backendUrl}/api/auth/reset-password/${token}`;
  await transporter.sendMail({
    from: `"${config.appName}" <${config.gmail.user}>`,
    to,
    subject: `Reset your ${config.appName} password`,
    html: `
      <h2>${config.appName} Password Reset</h2>
      <p>You requested a password reset. Click the link below to set a new password.</p>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      <a href="${link}" style="
        display:inline-block;padding:12px 24px;background:#2563eb;
        color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;
      ">Reset Password</a>
      <p>Or copy this link: ${link}</p>
    `,
  });
}
