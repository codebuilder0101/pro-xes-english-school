import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DatabaseFile, StoredMessage, StoredRoom, StoredUser } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "data", "db.json");

const defaultRooms: StoredRoom[] = [
  { id: "1", name: "Airport English", type: "group", flag: "✈️", lastMessage: "Can I see your boarding pass?", time: "2m", unread: 3, members: 24 },
  { id: "2", name: "Café Talk", type: "group", flag: "☕", lastMessage: "I'd like a cappuccino please", time: "5m", unread: 1, members: 18 },
  { id: "3", name: "Hotel Check-in", type: "group", flag: "🏨", lastMessage: "Do you have a reservation?", time: "12m", unread: 0, members: 15 },
  { id: "4", name: "Sarah M.", type: "tutor", flag: "🇺🇸", lastMessage: "Great pronunciation today!", time: "1h", unread: 0, online: true },
  { id: "5", name: "Carlos R.", type: "direct", flag: "🇧🇷", lastMessage: "Vamos praticar juntos?", time: "3h", unread: 2, online: true },
  { id: "6", name: "James K.", type: "tutor", flag: "🇬🇧", lastMessage: "Let's work on your accent next", time: "1d", unread: 0, online: false },
  { id: "7", name: "Yuki T.", type: "direct", flag: "🇯🇵", lastMessage: "Thank you for the tips!", time: "1d", unread: 0, online: false },
  { id: "8", name: "Shopping English", type: "group", flag: "🛍️", lastMessage: "How much does this cost?", time: "2d", unread: 0, members: 21 },
];

const defaultMessages: StoredMessage[] = [
  {
    id: "1",
    roomId: "2",
    senderId: "tutor-sarah",
    sender: "Sarah M.",
    avatar: "",
    flag: "🇺🇸",
    text: "Hi there! Welcome to our café. What can I get for you today?",
    time: "10:30",
    isTutor: true,
  },
  {
    id: "2",
    roomId: "2",
    senderId: "demo-user",
    sender: "You",
    avatar: "",
    flag: "🇧🇷",
    text: "Hello! Can I have a cappuccino, please?",
    time: "10:31",
  },
  {
    id: "3",
    roomId: "2",
    senderId: "tutor-sarah",
    sender: "Sarah M.",
    avatar: "",
    flag: "🇺🇸",
    text: "Of course! Would you like it with regular milk or oat milk?",
    time: "10:31",
    isTutor: true,
  },
  {
    id: "4",
    roomId: "2",
    senderId: "peer-carlos",
    sender: "Carlos R.",
    avatar: "",
    flag: "🇧🇷",
    text: "I want to practice ordering too! 😄",
    time: "10:32",
  },
  {
    id: "5",
    roomId: "2",
    senderId: "demo-user",
    sender: "You",
    avatar: "",
    flag: "🇧🇷",
    text: "Regular milk, please. And do you have any pastries?",
    time: "10:33",
  },
  {
    id: "6",
    roomId: "2",
    senderId: "tutor-sarah",
    sender: "Sarah M.",
    avatar: "",
    flag: "🇺🇸",
    text: "Yes! We have croissants, muffins, and scones. The blueberry scones are fresh today! 🫐",
    time: "10:33",
    isTutor: true,
  },
  {
    id: "7",
    roomId: "2",
    senderId: "peer-yuki",
    sender: "Yuki T.",
    avatar: "",
    flag: "🇯🇵",
    text: "What does 'scone' mean? Is it like a cookie?",
    time: "10:34",
  },
  {
    id: "8",
    roomId: "2",
    senderId: "tutor-sarah",
    sender: "Sarah M.",
    avatar: "",
    flag: "🇺🇸",
    text: "Great question, Yuki! A scone is a type of bread, usually slightly sweet. It's very popular in British and American cafés.",
    time: "10:35",
    isTutor: true,
  },
];

function ensureDataDir() {
  const dir = path.dirname(dataPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function load(): DatabaseFile {
  ensureDataDir();
  if (!fs.existsSync(dataPath)) {
    const initial: DatabaseFile = { users: [], rooms: defaultRooms, messages: defaultMessages };
    fs.writeFileSync(dataPath, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  const raw = fs.readFileSync(dataPath, "utf8");
  const parsed = JSON.parse(raw) as DatabaseFile;
  if (!parsed.users) parsed.users = [];
  if (!parsed.rooms?.length) parsed.rooms = defaultRooms;
  if (!parsed.messages?.length) parsed.messages = defaultMessages;
  return parsed;
}

let cache = load();

function persist() {
  ensureDataDir();
  fs.writeFileSync(dataPath, JSON.stringify(cache, null, 2), "utf8");
}

export function getDb() {
  return cache;
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return cache.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): StoredUser | undefined {
  return cache.users.find((u) => u.id === id);
}

export function insertUser(user: StoredUser) {
  cache.users.push(user);
  persist();
}

export function updateUser(id: string, patch: Partial<StoredUser>) {
  const u = cache.users.find((x) => x.id === id);
  if (!u) return;
  Object.assign(u, patch);
  persist();
}

export function listRooms(): StoredRoom[] {
  return cache.rooms;
}

export function listMessages(roomId: string): StoredMessage[] {
  return cache.messages.filter((m) => m.roomId === roomId).sort((a, b) => a.id.localeCompare(b.id));
}

export function appendMessage(msg: StoredMessage) {
  cache.messages.push(msg);
  const room = cache.rooms.find((r) => r.id === msg.roomId);
  if (room) {
    room.lastMessage = msg.text.length > 80 ? `${msg.text.slice(0, 77)}...` : msg.text;
    const now = new Date();
    room.time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  persist();
}
