import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, Mic, MicOff, Volume2, Search, Users, MessageSquare, GraduationCap, ArrowLeft, Hash } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import { Link } from "react-router-dom";

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

const mockRooms: Room[] = [
  { id: "1", name: "Airport English", type: "group", flag: "✈️", lastMessage: "Can I see your boarding pass?", time: "2m", unread: 3, members: 24 },
  { id: "2", name: "Café Talk", type: "group", flag: "☕", lastMessage: "I'd like a cappuccino please", time: "5m", unread: 1, members: 18 },
  { id: "3", name: "Hotel Check-in", type: "group", flag: "🏨", lastMessage: "Do you have a reservation?", time: "12m", unread: 0, members: 15 },
  { id: "4", name: "Sarah M.", type: "tutor", flag: "🇺🇸", lastMessage: "Great pronunciation today!", time: "1h", unread: 0, online: true },
  { id: "5", name: "Carlos R.", type: "direct", flag: "🇧🇷", lastMessage: "Vamos praticar juntos?", time: "3h", unread: 2, online: true },
  { id: "6", name: "James K.", type: "tutor", flag: "🇬🇧", lastMessage: "Let's work on your accent next", time: "1d", unread: 0, online: false },
  { id: "7", name: "Yuki T.", type: "direct", flag: "🇯🇵", lastMessage: "Thank you for the tips!", time: "1d", unread: 0, online: false },
  { id: "8", name: "Shopping English", type: "group", flag: "🛍️", lastMessage: "How much does this cost?", time: "2d", unread: 0, members: 21 },
];

const mockMessages: Message[] = [
  { id: "1", sender: "Sarah M.", avatar: "", flag: "🇺🇸", text: "Hi there! Welcome to our café. What can I get for you today?", time: "10:30", isTutor: true },
  { id: "2", sender: "You", avatar: "", flag: "🇧🇷", text: "Hello! Can I have a cappuccino, please?", time: "10:31", isOwn: true },
  { id: "3", sender: "Sarah M.", avatar: "", flag: "🇺🇸", text: "Of course! Would you like it with regular milk or oat milk?", time: "10:31", isTutor: true },
  { id: "4", sender: "Carlos R.", avatar: "", flag: "🇧🇷", text: "I want to practice ordering too! 😄", time: "10:32" },
  { id: "5", sender: "You", avatar: "", flag: "🇧🇷", text: "Regular milk, please. And do you have any pastries?", time: "10:33", isOwn: true },
  { id: "6", sender: "Sarah M.", avatar: "", flag: "🇺🇸", text: "Yes! We have croissants, muffins, and scones. The blueberry scones are fresh today! 🫐", time: "10:33", isTutor: true },
  { id: "7", sender: "Yuki T.", avatar: "", flag: "🇯🇵", text: "What does 'scone' mean? Is it like a cookie?", time: "10:34" },
  { id: "8", sender: "Sarah M.", avatar: "", flag: "🇺🇸", text: "Great question, Yuki! A scone is a type of bread, usually slightly sweet. It's very popular in British and American cafés.", time: "10:35", isTutor: true },
];

const ChatPage = () => {
  const { t } = useLanguage();
  const [selectedRoom, setSelectedRoom] = useState<Room>(mockRooms[1]);
  const [messages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"rooms" | "direct" | "tutors">("rooms");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredRooms = mockRooms.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "rooms") return r.type === "group" && matchesSearch;
    if (activeTab === "direct") return r.type === "direct" && matchesSearch;
    if (activeTab === "tutors") return r.type === "tutor" && matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 flex pt-16">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-80" : "w-0 overflow-hidden"} border-r border-border bg-card flex-shrink-0 flex flex-col transition-all duration-300`}>
          {/* Header */}
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

          {/* Tabs */}
          <div className="flex border-b border-border">
            {(["rooms", "direct", "tutors"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "rooms" && <Hash className="w-3.5 h-3.5" />}
                {tab === "direct" && <MessageSquare className="w-3.5 h-3.5" />}
                {tab === "tutors" && <GraduationCap className="w-3.5 h-3.5" />}
                {t(`chat.${tab}` as any)}
              </button>
            ))}
          </div>

          {/* Room list */}
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
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                    {room.flag}
                  </div>
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

        {/* Main chat area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <header className="h-14 border-b border-border bg-card flex items-center gap-3 px-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg">
              {selectedRoom.flag}
            </div>
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isOwn ? "flex-row-reverse" : ""}`}
              >
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
                      <button className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5 transition-colors">
                        <Volume2 className="w-3 h-3" /> {t("chat.listen")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <Input
                placeholder={t("chat.placeholder")}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && inputText.trim() && setInputText("")}
                className="flex-1 h-10"
              />
              <Button
                variant="hero"
                size="icon"
                className="w-10 h-10 rounded-full"
                disabled={!inputText.trim()}
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
