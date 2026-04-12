import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { useLanguage } from "@/i18n/LanguageContext";

export default function MfaSetupPage() {
  const { t } = useLanguage();

  return (
    <AuthCard>
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
          <Shield className="size-7" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("auth.mfaSetup.title")}</h1>
        <p className="mt-2 text-base text-muted-foreground">{t("auth.mfaSetup.subtitle")}</p>
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <Button className="min-h-11 w-full text-base font-bold" asChild>
          <Link to="/auth/otp">{t("auth.mfaSetup.primary")}</Link>
        </Button>
        <Button variant="ghost" className="min-h-11 w-full text-base font-bold" asChild>
          <Link to="/auth/welcome">{t("auth.mfaSetup.cta")}</Link>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link className="font-semibold text-primary underline-offset-2 hover:underline" to="/auth/mfa-challenge">
            {t("auth.mfaChallenge.title")}
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
