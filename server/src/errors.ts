import type { Response } from "express";

export type ApiErrorBody = { error: { code: string; message: string } };

export function sendError(res: Response, status: number, code: string, message: string) {
  const body: ApiErrorBody = { error: { code, message } };
  res.status(status).json(body);
}
