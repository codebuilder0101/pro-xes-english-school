import { Link, Outlet } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";
import xesAvatar from "@/assets/xes-avatar.jpeg";

export default function AuthLayout() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
          <Link
            to="/"
            aria-label="XES — home"
            className="flex min-h-11 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <img src={xesAvatar} alt="" className="size-9 rounded-lg object-cover" width={36} height={36} aria-hidden />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-extrabold text-foreground">XES</span>
              <span className="text-[10px] font-bold text-muted-foreground">{t("auth.brandSubtitle")}</span>
            </div>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="container mx-auto flex flex-col items-center px-4 pb-10 pt-6 sm:pb-16 sm:pt-10">
        <Outlet />
      </main>
    </div>
  );
}
