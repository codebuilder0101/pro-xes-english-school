import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthBackLink } from "@/components/auth/AuthBackLink";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPasswordField } from "@/components/auth/AuthPasswordField";
import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { AuthHelperText } from "@/components/auth/AuthHelperText";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/authValidation";
import { apiFetch, type ApiError } from "@/lib/api";
import { clearPasswordResetToken, getPasswordResetToken } from "@/lib/session";

function isTranslationKey(key: string): key is TranslationKey {
  return key.startsWith("auth.");
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    const reason = params.get("reason");
    if (reason === "expired" || reason === "invalid") {
      navigate(`/auth/link-error?reason=${reason}`, { replace: true });
      return;
    }
    const token = params.get("token") || getPasswordResetToken();
    if (!token) {
      setTokenError(t("auth.reset.missingToken"));
      return;
    }
    setTokenError(null);
    let cancelled = false;
    apiFetch<{ ok: boolean }>(`/api/auth/reset-password/status?token=${encodeURIComponent(token)}`).catch(() => {
      if (!cancelled) navigate("/auth/link-error?reason=expired", { replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate, params, t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const translate = (msg?: string) => {
    if (!msg) return undefined;
    return isTranslationKey(msg) ? t(msg) : msg;
  };

  const onSubmit = async (data: ResetPasswordValues) => {
    const token = params.get("token") || getPasswordResetToken();
    if (!token) {
      setTokenError(t("auth.reset.missingToken"));
      return;
    }
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password: data.password }),
      });
      clearPasswordResetToken();
      navigate("/auth/password-updated", { replace: true });
    } catch (e) {
      const err = e as ApiError;
      if (err.code === "INVALID_TOKEN") {
        navigate("/auth/link-error?reason=expired", { replace: true });
        return;
      }
      setTokenError(t("auth.error.network"));
    }
  };

  return (
    <AuthCard>
      <AuthBackLink to="/auth/sign-in">{t("auth.backSignIn")}</AuthBackLink>
      <div className="mt-4 space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("auth.reset.title")}</h1>
        <p className="text-base text-muted-foreground">{t("auth.reset.subtitle")}</p>
      </div>

      {tokenError ? (
        <p className="mt-6 text-sm text-destructive" role="alert">
          {tokenError}
        </p>
      ) : null}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthHelperText>{t("auth.signUp.reqTitle")}</AuthHelperText>
        <ul className="list-inside list-disc text-sm text-muted-foreground">
          <li>{t("auth.signUp.reqLength")}</li>
          <li>{t("auth.signUp.reqMix")}</li>
        </ul>
        <AuthPasswordField
          id="reset-password"
          label={t("auth.signUp.passwordLabel")}
          showLabel={t("auth.signIn.showPassword")}
          hideLabel={t("auth.signIn.hidePassword")}
          autoComplete="new-password"
          required
          error={translate(errors.password?.message)}
          {...register("password")}
        />
        <AuthPasswordField
          id="reset-confirm"
          label={t("auth.signUp.confirmLabel")}
          showLabel={t("auth.signIn.showPassword")}
          hideLabel={t("auth.signIn.hidePassword")}
          autoComplete="new-password"
          required
          error={translate(errors.confirmPassword?.message)}
          {...register("confirmPassword")}
        />
        <AuthPrimaryButton loading={isSubmitting} loadingLabel={t("auth.reset.submit")}>
          {t("auth.reset.submit")}
        </AuthPrimaryButton>
      </form>

      <p className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        <Link
          className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          to="/auth/link-error?reason=expired"
        >
          {t("auth.linkError.expired.title")}
        </Link>
        {" · "}
        <Link
          className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          to="/auth/link-error?reason=invalid"
        >
          {t("auth.linkError.invalid.title")}
        </Link>
      </p>
    </AuthCard>
  );
}
