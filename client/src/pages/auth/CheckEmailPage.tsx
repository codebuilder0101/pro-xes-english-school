import { Link, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthBackLink } from "@/components/auth/AuthBackLink";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthSecondaryLink } from "@/components/auth/AuthSecondaryLink";
import { useLanguage } from "@/i18n/LanguageContext";
import { apiFetch } from "@/lib/api";
import { setPasswordResetToken } from "@/lib/session";

export default function CheckEmailPage() {
  const { t } = useLanguage();
  const location = useLocation();
  const state = location.state as { flow?: string; email?: string } | null;
  const flow = state?.flow;
  const email = state?.email;

  const handleResend = async () => {
    if (flow === "reset" && email) {
      try {
        const res = await apiFetch<{ dev?: { resetToken?: string } }>("/api/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
        if (res.dev?.resetToken) setPasswordResetToken(res.dev.resetToken);
      } catch {
        /* ignore */
      }
    }
    toast.success(t("auth.checkEmail.resend"));
  };

  return (
    <AuthCard>
      <AuthBackLink to="/auth/sign-in">{t("auth.backSignIn")}</AuthBackLink>
      <div className="mt-6 flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
          <Mail className="size-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("auth.checkEmail.title")}</h1>
        <p className="mt-3 max-w-sm text-base text-muted-foreground">{t("auth.checkEmail.body")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t("auth.checkEmail.spamHint")}</p>
        {flow === "reset" ? (
          <p className="mt-4 text-base text-muted-foreground" role="status">
            {t("auth.forgot.success")}
          </p>
        ) : null}
        {flow === "reset" ? (
          <Button type="button" variant="secondary" className="mt-4 min-h-11 w-full text-base font-bold" asChild>
            <Link to="/auth/reset-password">{t("auth.reset.title")}</Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button type="button" variant="default" className="min-h-11 flex-1 text-base font-bold sm:flex-none" onClick={handleResend}>
          {t("auth.checkEmail.resend")}
        </Button>
        <Button type="button" variant="outline" className="min-h-11 flex-1 border-2 text-base font-bold sm:flex-none" asChild>
          <Link to={flow === "reset" ? "/auth/forgot-password" : "/auth/sign-up"}>{t("auth.checkEmail.other")}</Link>
        </Button>
      </div>

      <p className="mt-8 text-center">
        <AuthSecondaryLink to="/auth/sign-in">{t("auth.backSignIn")}</AuthSecondaryLink>
      </p>
    </AuthCard>
  );
}
