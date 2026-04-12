import { useNavigate } from "react-router-dom";
import { Inbox } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthSecondaryLink } from "@/components/auth/AuthSecondaryLink";
import { useLanguage } from "@/i18n/LanguageContext";

export default function VerifyEmailPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const resend = () => {
    toast.success(t("auth.verify.resend"));
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
        <Button type="button" className="min-h-11 w-full text-base font-bold" onClick={() => navigate("/auth/welcome", { replace: true, state: { from: "verify" } })}>
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
