import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-insecure-change-me";
const JWT_EXPIRES_SEC = Number(process.env.JWT_EXPIRES_SEC ?? 60 * 60 * 24 * 7);

export type AccessPayload = { sub: string; typ: "access" };

export function signAccessToken(userId: string): string {
  const payload: AccessPayload = { sub: userId, typ: "access" };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_SEC });
}

export function verifyAccessToken(token: string): AccessPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AccessPayload;
    if (decoded.typ !== "access" || !decoded.sub) return null;
    return decoded;
  } catch {
    return null;
  }
}
