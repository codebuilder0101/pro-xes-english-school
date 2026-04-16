import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { AuthBackLink } from "@/components/auth/AuthBackLink";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/i18n/LanguageContext";
import { apiFetch, type ApiError } from "@/lib/api";
import { getLastLoginEmail, setAccessToken } from "@/lib/session";

export default function MfaChallengePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [trust, setTrust] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.length !== 6) return;
    const email = getLastLoginEmail();
    if (!email) {
      setError(t("auth.otp.needEmail"));
      return;
    }
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const res = await apiFetch<{ token: string }>("/api/auth/mfa/verify-login", {
          method: "POST",
          body: JSON.stringify({ email, code: value }),
        });
        setAccessToken(res.token);
        navigate("/dashboard", { replace: true });
      } catch (err) {
        const ex = err as ApiError;
        setError(ex.message || t("auth.error.network"));
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <AuthCard>
      <AuthBackLink to="/auth/sign-in">{t("auth.backSignIn")}</AuthBackLink>
      <div className="mt-4 space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("auth.mfaChallenge.title")}</h1>
        <p className="text-base text-muted-foreground">{t("auth.mfaChallenge.subtitle")}</p>
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <form className="mt-8 space-y-6" onSubmit={submit}>
        <div>
          <Label htmlFor="mfa-otp" className="sr-only">
            {t("auth.mfaChallenge.title")}
          </Label>
          <InputOTP
            id="mfa-otp"
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            inputMode="numeric"
            autoComplete="one-time-code"
            value={value}
            onChange={setValue}
            containerClassName="justify-center gap-2 sm:justify-start"
          >
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="size-12 min-h-12 min-w-12 rounded-lg border-2 text-lg first:rounded-lg last:rounded-lg"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="mfa-trust"
            checked={trust}
            onCheckedChange={(v) => setTrust(v === true)}
            className="mt-1 size-5 min-h-5 min-w-5"
          />
          <Label htmlFor="mfa-trust" className="min-h-11 cursor-pointer text-base font-medium leading-snug">
            {t("auth.otp.trust")}
          </Label>
        </div>

        <AuthPrimaryButton loading={loading} disabled={value.length !== 6} loadingLabel={t("auth.otp.verify")}>
          {t("auth.otp.verify")}
        </AuthPrimaryButton>
      </form>
    </AuthCard>
  );
}
