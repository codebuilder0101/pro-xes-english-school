export type RoomType = "group" | "direct" | "tutor";

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
