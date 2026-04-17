import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Menu, Moon, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import xesAvatar from "@/assets/xes-avatar.jpeg";
import { useCurrentUser, type CurrentUser } from "@/lib/useCurrentUser";

const initialsOf = (u: CurrentUser) => {
  const source = (u.displayName || u.fullName || u.name || u.email || "?").trim();
  const parts = source.split(/\s+/);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
};

const useDarkMode = () => {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });
  useEffect(() => {
    const stored = localStorage.getItem("xes_theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);
  const toggle = (next: boolean) => {
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("xes_theme", next ? "dark" : "light");
  };
  return { dark, toggle };
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();
  const { user, signOut } = useCurrentUser();
  const { dark, toggle: toggleDark } = useDarkMode();

  const displayName = user
    ? user.displayName?.trim() || user.name?.trim() || user.email.split("@")[0]
    : "";
  const avatarUrl = user?.avatarUrl ?? null;

  const UserMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-accent transition-colors">
          <Avatar className="w-8 h-8">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {user ? initialsOf(user) : ""}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-semibold text-foreground max-w-[140px] truncate">
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-72 p-0 overflow-hidden">
        {user && (
          <>
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
              <Avatar className="w-12 h-12">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
                  {initialsOf(user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground truncate">{displayName}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide rounded-md px-1.5 py-0.5 bg-primary/10 text-primary">
                    Pro
                  </span>
                </div>
                <span className="text-xs text-muted-foreground truncate block">{user.email}</span>
              </div>
            </div>

            <div className="py-1">
              <MenuRow icon={<User className="w-4 h-4" />} label={t("nav.menu.myProfile")} to="/profile" />
            </div>

            <div className="border-t border-border px-4 py-3 flex items-center justify-between">
              <span className="flex items-center gap-3 text-sm text-foreground">
                <Moon className="w-4 h-4" />
                {t("nav.menu.darkMode")}
              </span>
              <Switch checked={dark} onCheckedChange={toggleDark} />
            </div>

            <div className="border-t border-border p-3">
              <Button variant="outline" className="w-full" onClick={signOut}>
                {t("nav.logout")}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={xesAvatar} alt="XES" className="w-9 h-9 rounded-lg object-cover" />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-extrabold text-foreground">XES</span>
            <span className="text-[10px] font-bold text-muted-foreground">X English School</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="/#scenarios" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">{t("nav.scenarios")}</a>
          <a href="/#how-it-works" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">{t("nav.howItWorks")}</a>
          <a href="/#tutors" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">{t("nav.tutors")}</a>
          <a href="/#pricing" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">{t("nav.pricing")}</a>
          <Link to="/chat" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">{t("nav.chat")}</Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? UserMenu : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth/sign-in">{t("nav.login")}</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/auth/sign-up">{t("nav.cta")}</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 animate-slide-up">
          <div className="flex flex-col gap-3">
            <a href="/#scenarios" className="text-sm font-semibold py-2 text-muted-foreground">{t("nav.scenarios")}</a>
            <a href="/#how-it-works" className="text-sm font-semibold py-2 text-muted-foreground">{t("nav.howItWorks")}</a>
            <a href="/#tutors" className="text-sm font-semibold py-2 text-muted-foreground">{t("nav.tutors")}</a>
            <a href="/#pricing" className="text-sm font-semibold py-2 text-muted-foreground">{t("nav.pricing")}</a>
            <Link to="/chat" className="text-sm font-semibold py-2 text-muted-foreground">{t("nav.chat")}</Link>
            {user ? (
              <>
                <div className="flex items-center gap-3 py-2 border-t border-border pt-3">
                  <Avatar className="w-10 h-10">
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                      {initialsOf(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col leading-tight min-w-0">
                    <span className="text-sm font-semibold truncate">{displayName}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full min-h-11" onClick={signOut}>
                  {t("nav.logout")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full min-h-11" asChild>
                  <Link to="/auth/sign-in">{t("nav.login")}</Link>
                </Button>
                <Button variant="hero" className="w-full min-h-11" asChild>
                  <Link to="/auth/sign-up">{t("nav.cta")}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const MenuRow = ({
  icon,
  label,
  to,
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
  trailing?: React.ReactNode;
}) => (
  <Link
    to={to}
    className="flex items-center justify-between px-4 py-2.5 hover:bg-accent transition-colors"
  >
    <span className="flex items-center gap-3 text-sm text-foreground">
      {icon}
      {label}
    </span>
    {trailing}
  </Link>
);

export default Navbar;
