export type RoomType = "group" | "direct" | "tutor";

export type Gender = "female" | "male" | "non_binary" | "other" | "prefer_not_to_say";
export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "unknown";

export type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  newsletter?: boolean;
  emailVerified: boolean;
  locked: boolean;
  totpSecret?: string | null;
  flag?: string;
  createdAt: string;
  fullName?: string | null;
  displayName?: string | null;
  gender?: Gender | null;
  birthday?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  englishLevel?: EnglishLevel | null;
  address?: string | null;
};

export type StoredRoom = {
  id: string;
  name: string;
  type: RoomType;
  avatar?: string;
  flag?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
  members?: number;
};

export type StoredMessage = {
  id: string;
  roomId: string;
  senderId: string;
  sender: string;
  avatar: string;
  flag: string;
  text: string;
  time: string;
  isTutor?: boolean;
};

export type DatabaseFile = {
  users: StoredUser[];
  rooms: StoredRoom[];
  messages: StoredMessage[];
};
