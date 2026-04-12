import { cn } from "@/lib/utils";
import type { PasswordStrength } from "@/lib/authValidation";

type Props = {
  strength: PasswordStrength;
  score: number;
  labelWeak: string;
  labelFair: string;
  labelStrong: string;
  strengthLabel: string;
};

export function PasswordStrengthMeter({ strength, score, labelWeak, labelFair, labelStrong, strengthLabel }: Props) {
  const text = strength === "weak" ? labelWeak : strength === "fair" ? labelFair : labelStrong;
  const fillClass =
    strength === "weak" ? "bg-destructive" : strength === "fair" ? "bg-secondary" : "bg-primary";

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-foreground">{strengthLabel}</span>
        <span
          className={cn(
            "font-bold",
            strength === "weak" && "text-destructive",
            strength === "fair" && "text-secondary",
            strength === "strong" && "text-primary",
          )}
        >
          {text}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} aria-label={`${strengthLabel}: ${text}`}>
        <div className={cn("h-full rounded-full transition-all duration-300", fillClass)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
