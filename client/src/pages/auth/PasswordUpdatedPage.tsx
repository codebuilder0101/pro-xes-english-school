import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { useLanguage } from "@/i18n/LanguageContext";

export default function PasswordUpdatedPage() {
  const { t } = useLanguage();

  return (
    <AuthCard>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
          <CheckCircle2 className="size-9" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("auth.passwordUpdated.title")}</h1>
        <p className="mt-3 max-w-sm text-base text-muted-foreground">{t("auth.passwordUpdated.body")}</p>
      </div>
      <Button className="mt-8 min-h-11 w-full text-base font-bold" asChild>
        <Link to="/auth/sign-in">{t("auth.passwordUpdated.cta")}</Link>
      </Button>
    </AuthCard>
  );
}
