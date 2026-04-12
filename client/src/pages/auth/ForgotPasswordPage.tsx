import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthBackLink } from "@/components/auth/AuthBackLink";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthPrimaryButton } from "@/components/auth/AuthPrimaryButton";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { useLanguage } from "@/i18n/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { emailSchema } from "@/lib/authValidation";
import { apiFetch } from "@/lib/api";
import { setPasswordResetToken } from "@/lib/session";

const schema = z.object({ email: emailSchema });
type Values = z.infer<typeof schema>;

function isTranslationKey(key: string): key is TranslationKey {
  return key.startsWith("auth.");
}

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const translate = (msg?: string) => {
    if (!msg) return undefined;
    return isTranslationKey(msg) ? t(msg) : msg;
  };

  const onSubmit = async (data: Values) => {
    try {
      const res = await apiFetch<{ dev?: { resetToken?: string } }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: data.email }),
      });
      if (res.dev?.resetToken) setPasswordResetToken(res.dev.resetToken);
    } catch {
      /* Avoid email enumeration; still continue to inbox guidance */
    }
    navigate("/auth/check-email", { state: { flow: "reset", email: data.email } });
  };

  return (
    <AuthCard>
      <AuthBackLink to="/auth/sign-in">{t("auth.backSignIn")}</AuthBackLink>
      <div className="mt-4 space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("auth.forgot.title")}</h1>
        <p className="text-base text-muted-foreground">{t("auth.forgot.subtitle")}</p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthTextField
          id="forgot-email"
          label={t("auth.signIn.emailLabel")}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          error={translate(errors.email?.message)}
          {...register("email")}
        />
        <AuthPrimaryButton loading={isSubmitting} loadingLabel={t("auth.forgot.submit")}>
          {t("auth.forgot.submit")}
        </AuthPrimaryButton>
      </form>
    </AuthCard>
  );
}
