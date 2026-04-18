import { Router } from "express";
import type { Response } from "express";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { z } from "zod";
import { findUserByEmail, findUserById, insertUser, updateUser } from "../store.js";
import { sendError } from "../errors.js";
import { signAccessToken } from "../authTokens.js";
import type { AuthedRequest } from "../middleware/requireAuth.js";
import { ACCESS_COOKIE, requireAuth } from "../middleware/requireAuth.js";
import type { StoredUser } from "../types.js";
import { sendVerificationEmail, sendPasswordResetEmail, sendMagicLinkEmail, sendOtpEmail } from "../mailer.js";

const isProd = process.env.NODE_ENV === "production";
const mailerLive = Boolean(process.env.RESEND_API_KEY);
// Only expose tokens in the API response when mail isn't actually being sent (local dev without Resend key).
const exposeDevTokens = !isProd && !mailerLive;

const ACCESS_COOKIE_MAX_AGE_MS = Number(process.env.JWT_EXPIRES_SEC ?? 60 * 60 * 24 * 30) * 1000;

function setAuthCookie(res: Response, token: string) {
  res.cookie(ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE_MS,
  });
}

function clearAuthCookie(res: Response) {
  res.clearCookie(ACCESS_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });
}

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
    fullName: u.fullName ?? null,
    displayName: u.displayName ?? null,
    gender: u.gender ?? null,
    birthday: u.birthday ?? null,
    avatarUrl: u.avatarUrl ?? null,
    phone: u.phone ?? null,
    englishLevel: u.englishLevel ?? null,
    address: u.address ?? null,
    language: u.language ?? null,
  };
}

router.post("/register", async (req, res) => {
  const body = z
    .object({
      email: emailSchema,
      password: passwordSchema,
      name: z.string().trim().min(1).max(120),
      fullName: z.string().trim().min(1).max(120).optional(),
      displayName: z.string().trim().min(1).max(80).optional(),
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
  const fullName = body.data.fullName ?? body.data.name;
  const displayName = body.data.displayName ?? fullName;
  const user = await insertUser({
    email: body.data.email,
    passwordHash,
    name: body.data.name,
    fullName,
    displayName,
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
  setAuthCookie(res, accessToken);
  res.json({
    token: accessToken,
    user: publicUser(user),
  });
});

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await findUserById(req.userId!);
  if (!user) {
    sendError(res, 404, "NOT_FOUND", "User not found");
    return;
  }
  res.json({ user: publicUser(user) });
});

const genderSchema = z.enum(["female", "male", "non_binary", "other", "prefer_not_to_say"]);
const englishLevelSchema = z.enum(["A1", "A2", "B1", "B2", "C1", "C2", "unknown"]);
const languageSchema = z.enum(["pt", "en"]);

const profilePatchSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  displayName: z.string().trim().min(1).max(80).optional(),
  gender: genderSchema.nullable().optional(),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .nullable()
    .optional()
    .refine(
      (v) => v == null || new Date(v + "T00:00:00Z").getTime() < Date.now(),
      { message: "Birthday must be in the past" },
    ),
  phone: z.string().trim().max(40).regex(/^[+()\-\s\d.]*$/).nullable().optional(),
  englishLevel: englishLevelSchema.nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
  language: languageSchema.nullable().optional(),
  // legacy/simple fields kept for backwards compatibility
  name: z.string().trim().min(1).max(80).optional(),
  flag: z.string().trim().min(1).max(8).optional(),
});

router.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = profilePatchSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid profile fields");
    return;
  }
  const patch: Partial<StoredUser> = {};
  const d = parsed.data;
  if (d.fullName !== undefined) patch.fullName = d.fullName;
  if (d.displayName !== undefined) patch.displayName = d.displayName;
  if (d.gender !== undefined) patch.gender = d.gender;
  if (d.birthday !== undefined) patch.birthday = d.birthday;
  if (d.phone !== undefined) patch.phone = d.phone;
  if (d.englishLevel !== undefined) patch.englishLevel = d.englishLevel;
  if (d.address !== undefined) {
    patch.address = d.address && d.address.length > 0 ? d.address : null;
  }
  if (d.language !== undefined) patch.language = d.language;
  if (d.name !== undefined) patch.name = d.name;
  if (d.flag !== undefined) patch.flag = d.flag;
  if (Object.keys(patch).length === 0) {
    sendError(res, 400, "VALIDATION_ERROR", "No fields to update");
    return;
  }
  await updateUser(req.userId!, patch);
  const user = await findUserById(req.userId!);
  if (!user) {
    sendError(res, 404, "NOT_FOUND", "User not found");
    return;
  }
  res.json({ user: publicUser(user) });
});

const AVATAR_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const avatarSchema = z.object({
  mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
  // base64 with optional data: prefix
  data: z.string().min(16).max(Math.ceil((AVATAR_MAX_BYTES * 4) / 3) + 64),
});

router.post("/me/avatar", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = avatarSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 400, "VALIDATION_ERROR", "Invalid avatar payload (mime + base64 data)");
    return;
  }
  const ext = AVATAR_MIME_TO_EXT[parsed.data.mime];
  const raw = parsed.data.data.replace(/^data:[^;]+;base64,/, "");
  const buf = Buffer.from(raw, "base64");
  if (buf.byteLength === 0 || buf.byteLength > AVATAR_MAX_BYTES) {
    sendError(res, 400, "VALIDATION_ERROR", "Avatar must be 1 byte – 2 MB");
    return;
  }
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = process.env.UPLOAD_DIR ?? "/var/www/uploads";
  const subdir = path.join(dir, "avatars");
  await fs.mkdir(subdir, { recursive: true });
  const filename = `${req.userId}.${ext}`;
  const filePath = path.join(subdir, filename);
  await fs.writeFile(filePath, buf);
  // Remove other extensions for the same user so we don't keep stale variants
  for (const otherExt of Object.values(AVATAR_MIME_TO_EXT)) {
    if (otherExt === ext) continue;
    await fs.rm(path.join(subdir, `${req.userId}.${otherExt}`), { force: true });
  }
  const publicUrl = `/uploads/avatars/${filename}?v=${Date.now()}`;
  await updateUser(req.userId!, { avatarUrl: publicUrl });
  const user = await findUserById(req.userId!);
  if (!user) {
    sendError(res, 404, "NOT_FOUND", "User not found");
    return;
  }
  res.json({ user: publicUser(user) });
});

router.delete("/me/avatar", requireAuth, async (req: AuthedRequest, res) => {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const dir = process.env.UPLOAD_DIR ?? "/var/www/uploads";
  const subdir = path.join(dir, "avatars");
  for (const ext of Object.values(AVATAR_MIME_TO_EXT)) {
    await fs.rm(path.join(subdir, `${req.userId}.${ext}`), { force: true });
  }
  await updateUser(req.userId!, { avatarUrl: null });
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
  setAuthCookie(res, accessToken);
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
  setAuthCookie(res, accessToken);
  res.json({ token: accessToken, user: publicUser(user) });
});

export const authRouter = router;
