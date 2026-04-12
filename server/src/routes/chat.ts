import { Router } from "express";
import { z } from "zod";
import { appendMessage, findUserById, listMessages, listRooms } from "../store.js";
import { sendError } from "../errors.js";
import type { AuthedRequest } from "../middleware/requireAuth.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/rooms", requireAuth, (_req, res) => {
  res.json({ rooms: listRooms() });
});

router.get("/rooms/:roomId/messages", requireAuth, (req: AuthedRequest, res) => {
  const roomId = z.string().min(1).safeParse(req.params.roomId);
  if (!roomId.success) {
    sendError(res, 400, "VALIDATION_ERROR", "Invalid room id");
    return;
  }
  const msgs = listMessages(roomId.data).map((m) => {
    const isOwn = m.senderId === req.userId;
    return {
      id: m.id,
      sender: m.sender,
      avatar: m.avatar,
      flag: m.flag,
      text: m.text,
      time: m.time,
      isOwn,
      isTutor: m.isTutor,
    };
  });
  res.json({ messages: msgs });
});

router.post("/rooms/:roomId/messages", requireAuth, (req: AuthedRequest, res) => {
  const roomId = z.string().min(1).safeParse(req.params.roomId);
  const body = z.object({ text: z.string().min(1).max(4000) }).safeParse(req.body);
  if (!roomId.success || !body.success) {
    sendError(res, 400, "VALIDATION_ERROR", "Invalid payload");
    return;
  }
  const user = findUserById(req.userId!);
  if (!user) {
    sendError(res, 404, "NOT_FOUND", "User not found");
    return;
  }
  const existing = listMessages(roomId.data);
  const id = String(Math.max(0, ...existing.map((m) => Number(m.id) || 0)) + 1);
  const msg = {
    id,
    roomId: roomId.data,
    senderId: user.id,
    sender: user.name || "You",
    avatar: "",
    flag: user.flag ?? "🇧🇷",
    text: body.data.text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
  appendMessage(msg);
  res.status(201).json({
    message: {
      id: msg.id,
      sender: msg.sender,
      avatar: msg.avatar,
      flag: msg.flag,
      text: msg.text,
      time: msg.time,
      isOwn: true,
    },
  });
});

export const chatRouter = router;
