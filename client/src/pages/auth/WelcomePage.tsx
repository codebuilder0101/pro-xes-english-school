import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { useLanguage } from "@/i18n/LanguageContext";

export default function WelcomePage() {
  const { t } = useLanguage();

  return (
    <AuthCard>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary" aria-hidden>
          <Sparkles className="size-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("auth.welcome.title")}</h1>
        <p className="mt-3 max-w-sm text-base text-muted-foreground">{t("auth.welcome.body")}</p>
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <Button variant="default" className="min-h-11 w-full text-base font-bold" asChild>
          <Link to="/#scenarios">{t("auth.welcome.scenarios")}</Link>
        </Button>
        <Button variant="outline" className="min-h-11 w-full border-2 text-base font-bold" asChild>
          <Link to="/chat">{t("auth.welcome.chat")}</Link>
        </Button>
        <Button variant="ghost" className="min-h-11 w-full text-base font-bold" asChild>
          <Link to="/">{t("auth.welcome.home")}</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
