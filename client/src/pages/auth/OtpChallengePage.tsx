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

export default function OtpChallengePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [trust, setTrust] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.length !== 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/auth/welcome", { replace: true, state: { from: "otp" } });
    }, 600);
  };

  return (
    <AuthCard>
      <AuthBackLink to="/auth/sign-in">{t("auth.backSignIn")}</AuthBackLink>
      <div className="mt-4 space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("auth.otp.title")}</h1>
        <p className="text-base text-muted-foreground">{t("auth.otp.subtitle")}</p>
      </div>

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
