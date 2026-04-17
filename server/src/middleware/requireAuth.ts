import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../authTokens.js";
import { findUserById } from "../store.js";
import { sendError } from "../errors.js";

export type AuthedRequest = Request & { userId?: string };

export const ACCESS_COOKIE = "xes_access";

export function readAccessToken(req: Request): string | null {
  const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies?.[ACCESS_COOKIE];
  if (cookieToken) return cookieToken;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = readAccessToken(req);
  if (!token) {
    sendError(res, 401, "UNAUTHORIZED", "Missing access token");
    return;
  }
  const payload = verifyAccessToken(token);
  if (!payload) {
    sendError(res, 401, "UNAUTHORIZED", "Invalid or expired token");
    return;
  }
  const user = await findUserById(payload.sub);
  if (!user) {
    sendError(res, 401, "UNAUTHORIZED", "User not found");
    return;
  }
  if (user.locked) {
    sendError(res, 403, "ACCOUNT_LOCKED", "Account is locked");
    return;
  }
  req.userId = user.id;
  next();
}
