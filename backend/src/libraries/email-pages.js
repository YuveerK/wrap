import { config } from "../config/index.js";

function layout(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — ${config.appName}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 32rem; margin: 2rem auto; padding: 0 1rem; color: #222; }
    h1 { font-size: 1.5rem; }
    p { line-height: 1.5; color: #444; }
    .ok { color: #16a34a; }
    .err { color: #dc2626; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
</body>
</html>`;
}

export function verificationSuccessPage() {
  return layout(
    "Email verified",
    `<p class="ok">Your email is verified. You can log in to ${config.appName} on your phone now.</p>
     <p>Open the app and sign in with your email and password.</p>`,
  );
}

/**
 * @param {string} message
 */
export function verificationErrorPage(message) {
  return layout(
    "Verification failed",
    `<p class="err">${message}</p>
     <p>If the link expired, register again or contact support.</p>`,
  );
}
