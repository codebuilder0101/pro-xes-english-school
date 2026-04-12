import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Mic, MicOff, Volume2, Search, Users, MessageSquare, GraduationCap, ArrowLeft, Hash } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import { Link } from "react-router-dom";
import { apiFetch, type ApiError } from "@/lib/api";

interface Message {
  id: string;
  sender: string;
  avatar: string;
  flag: string;
  text: string;
  time: string;
  isOwn?: boolean;
  isTutor?: boolean;
}

interface Room {
  id: string;
  name: string;
  type: "group" | "direct" | "tutor";
  avatar?: string;
  flag?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online?: boolean;
  members?: number;
}

const ChatPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"rooms" | "direct" | "tutors">("rooms");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const redirectIfUnauthorized = useCallback(
    (err: unknown) => {
      const e = err as ApiError;
      if (e.status === 401) {
        navigate("/auth/sign-in", { replace: true, state: { from: "/chat" } });
        return true;
      }
      return false;
    },
    [navigate],
  );

  useEffect(() => {
    void (async () => {
      setLoadError(null);
      try {
        const data = await apiFetch<{ rooms: Room[] }>("/api/chat/rooms");
        setRooms(data.rooms);
        setSelectedRoom((prev) => {
          if (prev && data.rooms.some((r) => r.id === prev.id)) return prev;
          return data.rooms[1] ?? data.rooms[0] ?? null;
        });
      } catch (e) {
        if (redirectIfUnauthorized(e)) return;
        setLoadError(t("auth.error.network"));
      }
    })();
  }, [navigate, redirectIfUnauthorized, t]);

  useEffect(() => {
    if (!selectedRoom) return;
    void (async () => {
      try {
        const data = await apiFetch<{ messages: Message[] }>(`/api/chat/rooms/${selectedRoom.id}/messages`);
        setMessages(data.messages);
      } catch (e) {
        if (redirectIfUnauthorized(e)) return;
        setMessages([]);
      }
    })();
  }, [selectedRoom, redirectIfUnauthorized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!selectedRoom || !inputText.trim()) return;
    const text = inputText.trim();
    void (async () => {
      try {
        const res = await apiFetch<{ message: Message }>(`/api/chat/rooms/${selectedRoom.id}/messages`, {
          method: "POST",
          body: JSON.stringify({ text }),
        });
        const msg: Message = { ...res.message, isOwn: true };
        setMessages((prev) => [...prev, msg]);
        setInputText("");
        setRooms((prev) =>
          prev.map((r) =>
            r.id === selectedRoom.id
              ? {
                  ...r,
                  lastMessage: text.length > 80 ? `${text.slice(0, 77)}...` : text,
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                }
              : r,
          ),
        );
      } catch (e) {
        if (redirectIfUnauthorized(e)) return;
      }
    })();
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "rooms") return r.type === "group" && matchesSearch;
    if (activeTab === "direct") return r.type === "direct" && matchesSearch;
    if (activeTab === "tutors") return r.type === "tutor" && matchesSearch;
    return matchesSearch;
  });

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16 px-4">
          <p className="text-muted-foreground text-center">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!selectedRoom) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16 px-4">
          <p className="text-muted-foreground text-center">{t("chat.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 flex pt-16">
        <aside className={`${sidebarOpen ? "w-80" : "w-0 overflow-hidden"} border-r border-border bg-card flex-shrink-0 flex flex-col transition-all duration-300`}>
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-extrabold text-foreground mb-3">{t("chat.title")}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("chat.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-muted/50"
              />
            </div>
          </div>

          <div className="flex border-b border-border">
            {(["rooms", "direct", "tutors"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "rooms" && <Hash className="w-3.5 h-3.5" />}
                {tab === "direct" && <MessageSquare className="w-3.5 h-3.5" />}
                {tab === "tutors" && <GraduationCap className="w-3.5 h-3.5" />}
                {t(`chat.${tab}` as TranslationKey)}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left ${
                  selectedRoom.id === room.id ? "bg-primary/10" : ""
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">{room.flag}</div>
                  {room.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground truncate">{room.name}</span>
                    <span className="text-[10px] text-muted-foreground">{room.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate">{room.lastMessage}</p>
                    {room.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                        {room.unread}
                      </span>
                    )}
                  </div>
                  {room.members && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3" /> {room.members} {t("chat.members")}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border bg-card flex items-center gap-3 px-4">
            <button className="lg:hidden" type="button" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg">{selectedRoom.flag}</div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{selectedRoom.name}</h3>
              <p className="text-[10px] text-muted-foreground">
                {selectedRoom.members
                  ? `${selectedRoom.members} ${t("chat.members")}`
                  : selectedRoom.online
                    ? `🟢 ${t("chat.online")}`
                    : ""}
              </p>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.isOwn ? "flex-row-reverse" : ""}`}>
                {!msg.isOwn && (
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className={`text-xs font-bold ${msg.isTutor ? "bg-primary/20 text-primary" : "bg-muted"}`}>
                      {msg.flag}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[70%] ${msg.isOwn ? "items-end" : ""}`}>
                  {!msg.isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-foreground">{msg.sender}</span>
                      {msg.isTutor && (
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">Tutor</span>
                      )}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm ${
                      msg.isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card shadow-sm border border-border rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-2 mt-1 ${msg.isOwn ? "justify-end" : ""}`}>
                    <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    {!msg.isOwn && (
                      <button
                        type="button"
                        className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5 transition-colors"
                      >
                        <Volume2 className="w-3 h-3" /> {t("chat.listen")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isRecording ? "bg-red-500 text-white animate-pulse" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <Input
                placeholder={t("chat.placeholder")}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputText.trim()) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="flex-1 h-10"
              />
              <Button
                type="button"
                variant="hero"
                size="icon"
                className="w-10 h-10 rounded-full"
                disabled={!inputText.trim()}
                onClick={sendMessage}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">{t("chat.voiceHint")}</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
