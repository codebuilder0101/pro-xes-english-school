import { Router } from "express";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { z } from "zod";
import { findUserByEmail, findUserById, insertUser, updateUser } from "../store.js";
import { sendError } from "../errors.js";
import { signAccessToken } from "../authTokens.js";
import type { AuthedRequest } from "../middleware/requireAuth.js";
import { requireAuth } from "../middleware/requireAuth.js";
import type { StoredUser } from "../types.js";
import { sendVerificationEmail, sendPasswordResetEmail, sendMagicLinkEmail, sendOtpEmail } from "../mailer.js";

const isProd = process.env.NODE_ENV === "production";
const mailerLive = Boolean(process.env.RESEND_API_KEY);
// Only expose tokens in the API response when mail isn't actually being sent (local dev without Resend key).
const exposeDevTokens = !isProd && !mailerLive;

const router = Router();

const emailSchema = z.string().trim().email();
const passwordSchema = z
  .string()
  .min(8)
  .regex(/[a-zA-Z]/)
  .regex(/[0-9]/);

const memory = {
  resetTokens: new Map<string, { userId: string; expires: number }>(),
  verifyTokens: new Map<string, { userId: string; expires: number }>(),
  magicTokens: new Map<string, { email: string; expires: number }>(),
  otpSessions: new Map<string, { email: string; code: string; expires: number }>(),
};

function token(): string {
  return randomBytes(24).toString("hex");
}

function otpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function publicUser(u: StoredUser) {
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    emailVerified: u.emailVerified,
    flag: u.flag ?? "🇧🇷",
  };
}

router.post("/register", async (req, res) => {
  const body = z
    .object({
      email: emailSchema,
      password: passwordSchema,
      name: z.string().trim().optional(),
      newsletter: z.boolean().optional(),
    })
    .safeParse(req.body);

  if (!body.success) {
    sendError(res, 400, "VALIDATION_ERROR", "Invalid registration payload");
    return;
  }

  if (await findUserByEmail(body.data.email)) {
    sendError(res, 409, "EMAIL_IN_USE", "Email is already registered");
    return;
  }

  const passwordHash = await bcrypt.hash(body.data.password, 10);
  const user = await insertUser({
    email: body.data.email,
    passwordHash,
    name: body.data.name,
    newsletter: body.data.newsletter,
    locked: body.data.email.toLowerCase() === "locked@example.com",
  });

  const verifyToken = token();
  memory.verifyTokens.set(verifyToken, { userId: user.id, expires: Date.now() + 1000 * 60 * 60 * 24 });
  sendVerificationEmail(user.email, verifyToken).catch((e) => console.error(e));

  res.status(201).json({
    user: publicUser(user),
    ...(exposeDevTokens ? { dev: { verificationToken: verifyToken } } : {}),
  });
});

router.post("/login", async (req, res) => {
  const body = z.object({ email: emailSchema, password: z.string().min(1) }).safeParse(req.body);
  if (!body.success) {
    sendError(res, 400, "VALIDATION_ERROR", "Invalid login payload");
    return;
  }

  const user = await findUserByEmail(body.data.email);
  if (!user) {
    sendError(res, 401, "INVALID_CREDENTIALS", "Invalid email or password");
    return;
  }
  if (user.locked) {
    sendError(res, 403, "ACCOUNT_LOCKED", "Account is locked");
    return;
  }

  const ok = await bcrypt.compare(body.data.password, user.passwordHash);
  if (!ok) {
    sendError(res, 401, "INVALID_CREDENTIALS", "Invalid email or password");
    return;
  }

  if (!user.emailVerified) {
    sendError(res, 403, "EMAIL_NOT_VERIFIED", "Please verify your email before signing in");
    return;
  }

  const accessToken = signAccessToken(user.id);
  res.json({
    token: accessToken,
    user: publicUser(user),
  });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await findUserById(req.userId!);
  if (!user) {
    sendError(res, 404, "NOT_FOUND", "User not found");
    return;
  }
  res.json({ user: publicUser(user) });
});

router.post("/verify-email", async (req, res) => {
  const body = z.object({ token: z.string().min(10) }).safeParse(req.body);
  if (!body.success) {
    sendError(res, 400, "VALIDATION_ERROR", "Token required");
    return;
  }
  const entry = memory.verifyTokens.get(body.data.token);
  if (!entry || entry.expires < Date.now()) {
    sendError(res, 400, "INVALID_TOKEN", "Verification link is invalid or expired");
    return;
  }
  memory.verifyTokens.delete(body.data.token);
  await updateUser(entry.userId, { emailVerified: true });
  const user = await findUserById(entry.userId);
  if (!user) {
    sendError(res, 404, "NOT_FOUND", "User not found");
    return;
  }
  res.json({ user: publicUser(user) });
});

router.post("/resend-verification", async (req, res) => {
  const body = z.object({ email: emailSchema }).safeParse(req.body);
  if (!body.success) {
    sendError(res, 400, "VALIDATION_ERROR", "Invalid email");
    return;
  }
  const user = await findUserByEmail(body.data.email);
  if (!user) {
    res.json({ ok: true });
    return;
  }
  if (user.emailVerified) {
    res.json({ ok: true });
    return;
  }
  const verifyToken = token();
  memory.verifyTokens.set(verifyToken, { userId: user.id, expires: Date.now() + 1000 * 60 * 60 * 24 });
  sendVerificationEmail(user.email, verifyToken).catch((e) => console.error(e));
  res.json({ ok: true, ...(exposeDevTokens ? { dev: { verificationToken: verifyToken } } : {}) });
});

router.post("/forgot-password", async (req, res) => {
  const body = z.object({ email: emailSchema }).safeParse(req.body);
  if (!body.success) {
    sendError(res, 400, "VALIDATION_ERROR", "Invalid email");
    return;
  }
  const user = await findUserByEmail(body.data.email);
  if (user) {
    const resetToken = token();
    memory.resetTokens.set(resetToken, { userId: user.id, expires: Date.now() + 1000 * 60 * 60 });
    sendPasswordResetEmail(user.email, resetToken).catch((e) => console.error(e));
    res.json({ ok: true, ...(exposeDevTokens ? { dev: { resetToken } } : {}) });
    return;
  }
  res.json({ ok: true });
});

router.post("/reset-password", async (req, res) => {
  const body = z
    .object({
      token: z.string().min(10),
      password: passwordSchema,
    })
    .safeParse(req.body);
  if (!body.success) {
    sendError(res, 400, "VALIDATION_ERROR", "Invalid payload");
    return;
  }
  const entry = memory.resetTokens.get(body.data.token);
  if (!entry || entry.expires < Date.now()) {
    sendError(res, 400, "INVALID_TOKEN", "Reset link is invalid or expired");
    return;
  }
  memory.resetTokens.delete(body.data.token);
  const passwordHash = await bcrypt.hash(body.data.password, 10);
  await updateUser(entry.userId, { passwordHash });
  res.json({ ok: true });
});

router.get("/reset-password/status", (req, res) => {
  const raw = req.query.token;
  const tokenParam = z.string().min(10).safeParse(typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined);
  if (!tokenParam.success) {
    sendError(res, 400, "VALIDATION_ERROR", "token query required");
    return;
  }
  const entry = memory.resetTokens.get(tokenParam.data);
  if (!entry || entry.expires < Date.now()) {
    sendError(res, 400, "INVALID_TOKEN", "Reset link is invalid or expired");
    return;
  }
  res.json({ ok: true });
});

router.post("/magic-link", async (req, res) => {
  const body = z.object({ email: emailSchema }).safeParse(req.body);
  if (!body.success) {
    sendError(res, 400, "VALIDATION_ERROR", "Invalid email");
    return;
  }
  const user = await findUserByEmail(body.data.email);
  if (!user) {
    res.json({ ok: true });
    return;
  }
  const magic = token();
  memory.magicTokens.set(magic, { email: user.email, expires: Date.now() + 1000 * 60 * 30 });
  sendMagicLinkEmail(user.email, magic).catch((e) => console.error(e));
  res.json({ ok: true, ...(exposeDevTokens ? { dev: { magicToken: magic } } : {}) });
});

router.post("/magic-link/consume", async (req, res) => {
  const body = z.object({ token: z.string().min(10) }).safeParse(req.body);
  if (!body.success) {
    sendError(res, 400, "VALIDATION_ERROR", "Token required");
    return;
  }
  const entry = memory.magicTokens.get(body.data.token);
  if (!entry || entry.expires < Date.now()) {
    sendError(res, 400, "INVALID_TOKEN", "Magic link is invalid or expired");
    return;
  }
  memory.magicTokens.delete(body.data.token);
  const user = await findUserByEmail(entry.email);
  if (!user) {
    sendError(res, 404, "NOT_FOUND", "User not found");
    return;
  }
  const accessToken = signAccessToken(user.id);
  res.json({ token: accessToken, user: publicUser(user) });
});

router.post("/otp/start", async (req, res) => {
  const body = z.object({ email: emailSchema }).safeParse(req.body);
  if (!body.success) {
    sendError(res, 400, "VALIDATION_ERROR", "Invalid email");
    return;
  }
  const user = await findUserByEmail(body.data.email);
  if (!user) {
    sendError(res, 404, "NOT_FOUND", "No account for this email");
    return;
  }
  const sessionId = token();
  const code = otpCode();
  memory.otpSessions.set(sessionId, {
    email: user.email,
    code,
    expires: Date.now() + 1000 * 60 * 10,
  });
  sendOtpEmail(user.email, code).catch((e) => console.error(e));
  res.json({ sessionId, ...(exposeDevTokens ? { dev: { code } } : {}) });
});

router.post("/otp/verify", async (req, res) => {
  const body = z.object({ sessionId: z.string().min(10), code: z.string().length(6) }).safeParse(req.body);
  if (!body.success) {
    sendError(res, 400, "VALIDATION_ERROR", "sessionId and 6-digit code required");
    return;
  }
  const entry = memory.otpSessions.get(body.data.sessionId);
  if (!entry || entry.expires < Date.now()) {
    sendError(res, 400, "INVALID_SESSION", "Code expired. Request a new one.");
    return;
  }
  if (entry.code !== body.data.code) {
    sendError(res, 400, "INVALID_CODE", "Incorrect code");
    return;
  }
  memory.otpSessions.delete(body.data.sessionId);
  const user = await findUserByEmail(entry.email);
  if (!user) {
    sendError(res, 404, "NOT_FOUND", "User not found");
    return;
  }
  res.json({ ok: true });
});

router.post("/mfa/setup", requireAuth, async (req: AuthedRequest, res) => {
  const user = await findUserById(req.userId!);
  if (!user) {
    sendError(res, 404, "NOT_FOUND", "User not found");
    return;
  }
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(user.email, "Pro XES English", secret);
  res.json({ secret, otpauthUrl });
});

router.post("/mfa/activate", requireAuth, async (req: AuthedRequest, res) => {
  const body = z.object({ secret: z.string().min(10), code: z.string().min(6).max(8) }).safeParse(req.body);
  if (!body.success) {
    sendError(res, 400, "VALIDATION_ERROR", "secret and code required");
    return;
  }
  const user = await findUserById(req.userId!);
  if (!user) {
    sendError(res, 404, "NOT_FOUND", "User not found");
    return;
  }
  const ok = authenticator.verify({ token: body.data.code, secret: body.data.secret });
  if (!ok) {
    sendError(res, 400, "INVALID_CODE", "Authenticator code does not match");
    return;
  }
  await updateUser(user.id, { totpSecret: body.data.secret });
  res.json({ ok: true });
});

router.post("/mfa/verify-login", async (req, res) => {
  const body = z.object({ email: emailSchema, code: z.string().min(6).max(8) }).safeParse(req.body);
  if (!body.success) {
    sendError(res, 400, "VALIDATION_ERROR", "email and code required");
    return;
  }
  const user = await findUserByEmail(body.data.email);
  if (!user?.totpSecret) {
    sendError(res, 400, "MFA_NOT_CONFIGURED", "MFA is not enabled for this account");
    return;
  }
  const ok = authenticator.verify({ token: body.data.code, secret: user.totpSecret });
  if (!ok) {
    sendError(res, 400, "INVALID_CODE", "Incorrect authenticator code");
    return;
  }
  const accessToken = signAccessToken(user.id);
  res.json({ token: accessToken, user: publicUser(user) });
});

export const authRouter = router;
