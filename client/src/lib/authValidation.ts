import { z } from "zod";

export const emailSchema = z.string().min(1, "auth.error.required").email("auth.error.email");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "auth.error.required"),
});

export type SignInValues = z.infer<typeof signInSchema>;

const passwordRules = z
  .string()
  .min(8, "auth.error.passwordShort")
  .regex(/[a-zA-Z]/, "auth.error.passwordWeak")
  .regex(/[0-9]/, "auth.error.passwordWeak");

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "auth.error.required"),
    email: emailSchema,
    password: passwordRules,
    confirmPassword: z.string().min(1, "auth.error.required"),
    acceptTerms: z.boolean().refine((v) => v === true, { message: "auth.error.terms" }),
    newsletter: z.boolean().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "auth.error.passwordMismatch",
  });

export type SignUpValues = z.infer<typeof signUpSchema>;

export const forgotSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordRules,
    confirmPassword: z.string().min(1, "auth.error.required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "auth.error.passwordMismatch",
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const magicLinkSchema = z.object({
  email: emailSchema,
});

export type PasswordStrength = "weak" | "fair" | "strong";

export function scorePasswordStrength(password: string): { score: number; label: PasswordStrength } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score: Math.min(33, score * 16), label: "weak" };
  if (score <= 4) return { score: 66, label: "fair" };
  return { score: 100, label: "strong" };
}
