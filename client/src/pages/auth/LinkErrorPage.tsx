import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { useLanguage } from "@/i18n/LanguageContext";

export default function LinkErrorPage() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const reason = params.get("reason") === "invalid" ? "invalid" : "expired";

  const title = reason === "invalid" ? t("auth.linkError.invalid.title") : t("auth.linkError.expired.title");
  const body = reason === "invalid" ? t("auth.linkError.invalid.body") : t("auth.linkError.expired.body");

  return (
    <AuthCard>
      <div className="flex flex-col items-center text-center" role="alert">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive" aria-hidden>
          <AlertTriangle className="size-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
        <p className="mt-3 max-w-sm text-base text-muted-foreground">{body}</p>
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <Button className="min-h-11 w-full text-base font-bold" asChild>
          <Link to="/auth/forgot-password">{t("auth.forgot.submit")}</Link>
        </Button>
        <Button variant="outline" className="min-h-11 w-full border-2 text-base font-bold" asChild>
          <Link to="/auth/sign-in">{t("auth.backSignIn")}</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
