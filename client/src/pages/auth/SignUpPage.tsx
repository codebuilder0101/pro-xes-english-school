import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthCheckboxField } from "@/components/auth/AuthCheckboxField";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { AuthSecondaryLink } from "@/components/auth/AuthSecondaryLink";
import { AuthSocialButtons } from "@/components/auth/AuthSocialButtons";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { scorePasswordStrength, signUpSchema, type SignUpValues } from "@/lib/authValidation";
import { apiFetch, type ApiError } from "@/lib/api";
import { setEmailVerificationToken, setPendingSignupEmail } from "@/lib/session";

function isTranslationKey(key: string): key is TranslationKey {
  return key.startsWith("auth.");
}

export default function SignUpPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [banner, setBanner] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      newsletter: false,
    },
  });

  const pwd = watch("password") ?? "";
  const strength = useMemo(() => scorePasswordStrength(pwd), [pwd]);

  const translate = (msg?: string) => {
    if (!msg) return undefined;
    return isTranslationKey(msg) ? t(msg) : msg;
  };

  const onSubmit = async (data: SignUpValues) => {
    setBanner(null);
    try {
      const fullName = data.name.trim();
      const res = await apiFetch<{ dev?: { verificationToken?: string } }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: fullName,
          fullName,
          displayName: fullName,
          newsletter: data.newsletter,
        }),
      });
      setPendingSignupEmail(data.email);
      if (res.dev?.verificationToken) setEmailVerificationToken(res.dev.verificationToken);
      navigate("/auth/sign-in", { replace: true });
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 409) {
        setBanner(t("auth.error.emailInUse"));
        return;
      }
      setBanner(t("auth.error.network"));
    }
  };

  const strengthLabel =
    strength.label === "weak"
      ? t("auth.signUp.strength.weak")
      : strength.label === "fair"
        ? t("auth.signUp.strength.fair")
        : t("auth.signUp.strength.strong");

  return (
    <div className="relative w-full max-w-md pb-28 sm:pb-0">
      <AuthCard>
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("auth.signUp.title")}</h1>
          <p className="text-base text-muted-foreground">{t("auth.signUp.subtitle")}</p>
        </div>

        {banner ? (
          <Alert variant="destructive" className="mt-6" role="alert">
            <AlertDescription>{banner}</AlertDescription>
          </Alert>
        ) : null}

        <form id="signup-form" className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <AuthTextField
            id="signup-name"
            label={t("auth.signUp.nameLabel")}
            autoComplete="name"
            required
            placeholder="Alex Silva"
            error={translate(errors.name?.message)}
            {...register("name")}
          />
          <AuthTextField
            id="signup-email"
            label={t("auth.signUp.emailLabel")}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            error={translate(errors.email?.message)}
            {...register("email")}
          />

          <div className="space-y-2">
            <AuthPasswordField
              id="signup-password"
              label={t("auth.signUp.passwordLabel")}
              showLabel={t("auth.signIn.showPassword")}
              hideLabel={t("auth.signIn.hidePassword")}
              autoComplete="new-password"
              required
              error={translate(errors.password?.message)}
              {...register("password")}
            />
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground" aria-label={t("auth.signUp.reqTitle")}>
              <li>{t("auth.signUp.reqLength")}</li>
              <li>{t("auth.signUp.reqMix")}</li>
            </ul>
            {pwd.length > 0 ? (
              <PasswordStrengthMeter
                strength={strength.label}
                score={strength.score}
                labelWeak={t("auth.signUp.strength.weak")}
                labelFair={t("auth.signUp.strength.fair")}
                labelStrong={t("auth.signUp.strength.strong")}
                strengthLabel={t("auth.signUp.strengthLabel")}
              />
            ) : null}
          </div>

          <AuthPasswordField
            id="signup-confirm"
            label={t("auth.signUp.confirmLabel")}
            showLabel={t("auth.signIn.showPassword")}
            hideLabel={t("auth.signIn.hidePassword")}
            autoComplete="new-password"
            required
            error={translate(errors.confirmPassword?.message)}
            {...register("confirmPassword")}
          />

          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <AuthCheckboxField
                id="signup-terms"
                checked={field.value}
                onCheckedChange={field.onChange}
                error={translate(errors.acceptTerms?.message)}
              >
                {t("auth.signUp.terms")}{" "}
                <a href="#" className="font-bold text-primary underline underline-offset-2">
                  {t("auth.signUp.termsLink")}
                </a>{" "}
                {t("auth.signUp.and")}{" "}
                <a href="#" className="font-bold text-primary underline underline-offset-2">
                  {t("auth.signUp.privacyLink")}
                </a>
                .
              </AuthCheckboxField>
            )}
          />

          <Controller
            name="newsletter"
            control={control}
            render={({ field }) => (
              <AuthCheckboxField id="signup-newsletter" checked={field.value === true} onCheckedChange={field.onChange}>
                {t("auth.signUp.newsletter")}
              </AuthCheckboxField>
            )}
          />

          <div className="hidden sm:block">
            <AuthPrimaryButton loading={isSubmitting} disabled={!isValid} loadingLabel={t("auth.signUp.submit")}>
              {t("auth.signUp.submit")}
            </AuthPrimaryButton>
          </div>
        </form>

        <div className="mt-6 space-y-4">
          <AuthDivider label={t("auth.or")} />
          <AuthSocialButtons
            helper={t("auth.social.helper")}
            items={[
              { key: "google", label: t("auth.social.google") },
              { key: "apple", label: t("auth.social.apple") },
              { key: "facebook", label: t("auth.social.facebook") },
            ]}
          />
        </div>

        <p className="mt-8 text-center text-base">
          <AuthSecondaryLink to="/auth/sign-in">{t("auth.signUp.switch")}</AuthSecondaryLink>
        </p>
      </AuthCard>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-4 shadow-elevated backdrop-blur supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden">
        <AuthPrimaryButton
          form="signup-form"
          loading={isSubmitting}
          disabled={!isValid}
          loadingLabel={t("auth.signUp.submit")}
          className="w-full"
        >
          {t("auth.signUp.submit")}
        </AuthPrimaryButton>
      </div>
    </div>
  );
}
