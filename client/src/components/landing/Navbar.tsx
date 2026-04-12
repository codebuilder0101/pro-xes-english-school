import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import xesAvatar from "@/assets/xes-avatar.jpeg";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

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
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth/sign-in">{t("nav.login")}</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/auth/sign-up">{t("nav.cta")}</Link>
          </Button>
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
            <Button variant="ghost" className="w-full min-h-11" asChild>
              <Link to="/auth/sign-in">{t("nav.login")}</Link>
            </Button>
            <Button variant="hero" className="w-full min-h-11" asChild>
              <Link to="/auth/sign-up">{t("nav.cta")}</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
