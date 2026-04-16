import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../authTokens.js";
import { findUserById } from "../store.js";
import { sendError } from "../errors.js";

export type AuthedRequest = Request & { userId?: string };

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    sendError(res, 401, "UNAUTHORIZED", "Missing bearer token");
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
