import { useNavigate, useSearchParams } from "react-router-dom";
import { Inbox } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthSecondaryLink } from "@/components/auth/AuthSecondaryLink";
import { useLanguage } from "@/i18n/LanguageContext";
import { apiFetch, type ApiError } from "@/lib/api";
import {
  clearEmailVerificationToken,
  getEmailVerificationToken,
  getPendingSignupEmail,
  setEmailVerificationToken,
} from "@/lib/session";

export default function VerifyEmailPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const resend = async () => {
    const email = getPendingSignupEmail();
    if (!email) {
      toast.error(t("auth.error.network"));
      return;
    }
    try {
      const res = await apiFetch<{ dev?: { verificationToken?: string } }>("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (res.dev?.verificationToken) setEmailVerificationToken(res.dev.verificationToken);
      toast.success(t("auth.verify.resend"));
    } catch {
      toast.error(t("auth.error.network"));
    }
  };

  const complete = async () => {
    const token = params.get("token") || getEmailVerificationToken();
    if (!token) {
      toast.error(t("auth.reset.missingToken"));
      return;
    }
    try {
      await apiFetch("/api/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      clearEmailVerificationToken();
      navigate("/auth/welcome", { replace: true, state: { from: "verify" } });
    } catch (e) {
      const err = e as ApiError;
      if (err.code === "INVALID_TOKEN") {
        toast.error(t("auth.linkError.invalid.title"));
        return;
      }
      toast.error(t("auth.error.network"));
    }
  };

  return (
    <AuthCard>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
          <Inbox className="size-8" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("auth.verify.title")}</h1>
        <p className="mt-3 max-w-sm text-base text-muted-foreground">{t("auth.verify.body")}</p>
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <Button type="button" variant="outline" className="min-h-11 w-full border-2 text-base font-bold" onClick={resend}>
          {t("auth.verify.resend")}
        </Button>
        <Button type="button" className="min-h-11 w-full text-base font-bold" onClick={() => void complete()}>
          {t("auth.verify.done")}
        </Button>
      </div>
      <p className="mt-6 text-center">
        <AuthSecondaryLink to="/auth/check-email">{t("auth.checkEmail.title")}</AuthSecondaryLink>
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        <AuthSecondaryLink to="/auth/sign-in" className="text-sm">
          {t("auth.backSignIn")}
        </AuthSecondaryLink>
      </p>
    </AuthCard>
  );
}
