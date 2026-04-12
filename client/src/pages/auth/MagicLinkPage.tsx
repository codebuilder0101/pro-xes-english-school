import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { AuthBackLink } from "@/components/auth/AuthBackLink";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { magicLinkSchema } from "@/lib/authValidation";
import { apiFetch, type ApiError } from "@/lib/api";
import { setAccessToken, setLastLoginEmail } from "@/lib/session";
import type { z } from "zod";

type Values = z.infer<typeof magicLinkSchema>;

function isTranslationKey(key: string): key is TranslationKey {
  return key.startsWith("auth.");
}

export default function MagicLinkPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  const translate = (msg?: string) => {
    if (!msg) return undefined;
    return isTranslationKey(msg) ? t(msg) : msg;
  };

  const onSubmit = async (values: Values) => {
    setError(null);
    try {
      const res = await apiFetch<{ ok: boolean; dev?: { magicToken?: string } }>("/api/auth/magic-link", {
        method: "POST",
        body: JSON.stringify({ email: values.email }),
      });
      setLastLoginEmail(values.email);
      if (res.dev?.magicToken) {
        const session = await apiFetch<{ token: string }>("/api/auth/magic-link/consume", {
          method: "POST",
          body: JSON.stringify({ token: res.dev.magicToken }),
        });
        setAccessToken(session.token);
        navigate("/auth/welcome", { replace: true, state: { from: "magic-link" } });
        return;
      }
      setDone(true);
    } catch (e) {
      const err = e as ApiError;
      setError(err.message || t("auth.error.network"));
    }
  };

  return (
    <AuthCard>
      <AuthBackLink to="/auth/sign-in">{t("auth.backSignIn")}</AuthBackLink>
      <div className="mt-4 space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("auth.magic.title")}</h1>
        <p className="text-base text-muted-foreground">{t("auth.magic.subtitle")}</p>
      </div>

      {error ? (
        <Alert variant="destructive" className="mt-6" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {done ? (
        <Alert className="mt-6" role="status">
          <AlertDescription>{t("auth.magic.success")}</AlertDescription>
        </Alert>
      ) : null}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthTextField
          id="magic-email"
          label={t("auth.signIn.emailLabel")}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          error={translate(errors.email?.message)}
          {...register("email")}
        />
        <AuthPrimaryButton loading={isSubmitting} loadingLabel={t("auth.magic.submit")}>
          {t("auth.magic.submit")}
        </AuthPrimaryButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/auth/sign-in" className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
          {t("auth.backSignIn")}
        </Link>
      </p>
    </AuthCard>
  );
}
