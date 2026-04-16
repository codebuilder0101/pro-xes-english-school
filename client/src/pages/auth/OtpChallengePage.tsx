import { useEffect, useState } from "react";
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
import { getLastLoginEmail, getPendingSignupEmail, setOtpSessionId, getOtpSessionId } from "@/lib/session";

export default function OtpChallengePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [trust, setTrust] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    const email = getLastLoginEmail() || getPendingSignupEmail();
    if (!email) {
      setStartError(t("auth.otp.needEmail"));
      return;
    }
    void (async () => {
      try {
        const res = await apiFetch<{ sessionId: string }>("/api/auth/otp/start", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
        setOtpSessionId(res.sessionId);
        setStartError(null);
      } catch {
        setStartError(t("auth.error.network"));
      }
    })();
  }, [t]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.length !== 6) return;
    const sessionId = getOtpSessionId();
    if (!sessionId) {
      setVerifyError(t("auth.otp.needEmail"));
      return;
    }
    setLoading(true);
    setVerifyError(null);
    void (async () => {
      try {
        await apiFetch("/api/auth/otp/verify", {
          method: "POST",
          body: JSON.stringify({ sessionId, code: value }),
        });
        navigate("/dashboard", { replace: true });
      } catch (err) {
        const e = err as ApiError;
        setVerifyError(e.message || t("auth.error.network"));
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <AuthCard>
      <AuthBackLink to="/auth/sign-in">{t("auth.backSignIn")}</AuthBackLink>
      <div className="mt-4 space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("auth.otp.title")}</h1>
        <p className="text-base text-muted-foreground">{t("auth.otp.subtitle")}</p>
      </div>

      {startError ? <p className="mt-4 text-sm text-destructive">{startError}</p> : null}
      {verifyError ? <p className="mt-4 text-sm text-destructive">{verifyError}</p> : null}

      <form className="mt-8 space-y-6" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="otp-input" className="sr-only">
            {t("auth.otp.title")}
          </Label>
          <InputOTP
            id="otp-input"
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
          <p id="otp-hint" className="mt-3 text-sm text-muted-foreground">
            {t("auth.checkEmail.body")}
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border p-3">
          <Checkbox
            id="trust-device"
            checked={trust}
            onCheckedChange={(v) => setTrust(v === true)}
            className="mt-0.5 size-5 min-h-5 min-w-5"
            aria-describedby="trust-hint"
          />
          <div className="flex-1">
            <Label htmlFor="trust-device" className="cursor-pointer text-base font-semibold leading-snug">
              {t("auth.otp.trust")}
            </Label>
            <p id="trust-hint" className="mt-1 text-sm text-muted-foreground">
              {t("auth.otp.trustHint")}
            </p>
          </div>
        </div>

        <AuthPrimaryButton loading={loading} disabled={value.length !== 6} loadingLabel={t("auth.otp.verify")}>
          {t("auth.otp.verify")}
        </AuthPrimaryButton>
      </form>
    </AuthCard>
  );
}
