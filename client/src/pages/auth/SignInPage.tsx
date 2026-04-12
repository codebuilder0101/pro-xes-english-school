import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { AuthSecondaryLink } from "@/components/auth/AuthSecondaryLink";
import { AuthSocialButtons } from "@/components/auth/AuthSocialButtons";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { AuthSecurityModals } from "@/components/auth/AuthSecurityModals";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { signInSchema, type SignInValues } from "@/lib/authValidation";
import { apiFetch, type ApiError } from "@/lib/api";
import { setAccessToken, setLastLoginEmail } from "@/lib/session";

function isTranslationKey(key: string): key is TranslationKey {
  return key.startsWith("auth.");
}

export default function SignInPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [banner, setBanner] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const email = watch("email");
  const password = watch("password");

  useEffect(() => {
    const demo = params.get("demo");
    if (demo === "invalid") setBanner(t("auth.signIn.invalid"));
    else if (demo === "locked") setBanner(t("auth.signIn.locked"));
    else setBanner(null);
  }, [params, t]);

  useEffect(() => {
    if (email || password) setBanner(null);
  }, [email, password]);

  const translate = (msg?: string) => {
    if (!msg) return undefined;
    return isTranslationKey(msg) ? t(msg) : msg;
  };

  const onSubmit = async (data: SignInValues) => {
    clearErrors();
    if (data.password.toLowerCase() === "network") {
      setError("root", { message: t("auth.error.network") });
      return;
    }
    if (data.password.toLowerCase() === "wrong") {
      setBanner(t("auth.signIn.invalid"));
      return;
    }
    try {
      const res = await apiFetch<{ token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      setAccessToken(res.token);
      setLastLoginEmail(data.email);
      navigate("/auth/welcome", { replace: true, state: { from: "sign-in" } });
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 403 && err.code === "ACCOUNT_LOCKED") {
        setBanner(t("auth.signIn.locked"));
        return;
      }
      if (err.status === 401) {
        setBanner(t("auth.signIn.invalid"));
        return;
      }
      setError("root", { message: t("auth.error.network") });
    }
  };

  const rootMessage = errors.root?.message;

  return (
    <AuthCard>
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("auth.signIn.title")}</h1>
        <p className="text-base text-muted-foreground">{t("auth.signIn.subtitle")}</p>
      </div>

      {(banner || rootMessage) && (
        <Alert variant="destructive" className="mt-6" role="alert">
          <AlertDescription>{rootMessage ?? banner}</AlertDescription>
        </Alert>
      )}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthTextField
          id="signin-email"
          label={t("auth.signIn.emailLabel")}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          error={translate(errors.email?.message)}
          {...register("email")}
        />
        <AuthPasswordField
          id="signin-password"
          label={t("auth.signIn.passwordLabel")}
          showLabel={t("auth.signIn.showPassword")}
          hideLabel={t("auth.signIn.hidePassword")}
          autoComplete="current-password"
          required
          error={translate(errors.password?.message)}
          {...register("password")}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <AuthSecondaryLink to="/auth/forgot-password" className="min-h-11 py-2 text-sm">
            {t("auth.signIn.forgot")}
          </AuthSecondaryLink>
        </div>

        <AuthPrimaryButton loading={isSubmitting} loadingLabel={t("auth.signIn.submit")}>
          {t("auth.signIn.submit")}
        </AuthPrimaryButton>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <span className="sr-only">{t("auth.signIn.demoStates")}: </span>
        <Link
          to="/auth/sign-in?demo=invalid"
          className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {t("auth.signIn.demoInvalid")}
        </Link>
        {" · "}
        <Link
          to="/auth/sign-in?demo=locked"
          className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {t("auth.signIn.demoLocked")}
        </Link>
      </p>

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

      <div className="mt-6 space-y-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 min-h-11 w-full border-2 text-base font-bold"
          disabled
          aria-disabled="true"
          title={t("auth.passkey.helper")}
        >
          {t("auth.passkey.cta")}
        </Button>
        <p className="text-center text-sm text-muted-foreground">{t("auth.passkey.helper")}</p>
        <Button type="button" variant="ghost" className="h-11 min-h-11 w-full text-base font-bold" asChild>
          <Link to="/auth/magic-link">{t("auth.signIn.magicLink")}</Link>
        </Button>
      </div>

      <p className="mt-8 text-center text-base">
        <AuthSecondaryLink to="/auth/sign-up">{t("auth.signIn.switch")}</AuthSecondaryLink>
      </p>

      <AuthSecurityModals />
    </AuthCard>
  );
}
