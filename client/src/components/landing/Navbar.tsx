import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import xesAvatar from "@/assets/xes-avatar.jpeg";
import { useCurrentUser, type CurrentUser } from "@/lib/useCurrentUser";

const initialsOf = (u: CurrentUser) => {
  const source = (u.name || u.email || "?").trim();
  const parts = source.split(/\s+/);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();
  const { user, signOut } = useCurrentUser();

  const displayName = user ? user.name?.trim() || user.email.split("@")[0] : "";

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
          <LanguageSwitcher />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-accent transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {initialsOf(user)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold text-foreground max-w-[140px] truncate">
                    {displayName} {user.flag}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold truncate">{displayName}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
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
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
            </div>
            {user ? (
              <>
                <div className="flex items-center gap-3 py-2">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {initialsOf(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold">{displayName} {user.flag}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </div>
                <Button variant="ghost" className="w-full min-h-11 justify-start" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
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

export default Navbar;
