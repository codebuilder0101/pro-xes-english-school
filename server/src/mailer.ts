import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.MAIL_FROM ?? "Pro XES English <noreply@xenglishschool.com>";
const appUrl = process.env.PUBLIC_APP_URL ?? "https://xenglishschool.com";

const resend = apiKey ? new Resend(apiKey) : null;

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn(`[mailer] RESEND_API_KEY not set — would send "${subject}" to ${to}`);
    return;
  }
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) console.error("[mailer]", error);
}

const layout = (title: string, body: string) => `
<!doctype html><html><body style="font-family:system-ui,sans-serif;background:#f6f7fb;padding:24px;color:#111">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.05)">
    <h1 style="margin:0 0 16px;font-size:20px">${title}</h1>
    ${body}
    <p style="margin-top:32px;color:#888;font-size:12px">Pro XES English School · <a href="${appUrl}">${appUrl}</a></p>
  </div>
</body></html>`;

const button = (href: string, label: string) =>
  `<p><a href="${href}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">${label}</a></p>
   <p style="font-size:13px;color:#555">Or copy this link: <br/><span style="color:#2563eb;word-break:break-all">${href}</span></p>`;

export function sendVerificationEmail(to: string, token: string) {
  const link = `${appUrl}/auth/verify-email?token=${token}`;
  return send(
    to,
    "Verify your email",
    layout("Confirm your email", `<p>Welcome to Pro XES! Click the button below to verify your email address. This link expires in 24 hours.</p>${button(link, "Verify email")}`)
  );
}

export function sendPasswordResetEmail(to: string, token: string) {
  const link = `${appUrl}/auth/reset-password?token=${token}`;
  return send(
    to,
    "Reset your password",
    layout("Reset your password", `<p>We received a request to reset your password. This link expires in 1 hour. If you didn't request this, ignore this email.</p>${button(link, "Reset password")}`)
  );
}

export function sendMagicLinkEmail(to: string, token: string) {
  const link = `${appUrl}/auth/magic-link?token=${token}`;
  return send(
    to,
    "Your sign-in link",
    layout("Sign in to Pro XES", `<p>Click below to sign in. This link expires in 30 minutes.</p>${button(link, "Sign in")}`)
  );
}

export function sendOtpEmail(to: string, code: string) {
  return send(
    to,
    `Your code: ${code}`,
    layout("Your verification code", `<p>Use this 6-digit code to continue. It expires in 10 minutes.</p><p style="font-size:28px;font-weight:700;letter-spacing:6px;background:#f3f4f6;padding:16px;text-align:center;border-radius:8px">${code}</p>`)
  );
}
