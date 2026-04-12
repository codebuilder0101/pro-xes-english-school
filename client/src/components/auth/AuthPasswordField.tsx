import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InlineFieldError } from "./InlineFieldError";

export type AuthPasswordFieldProps = {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
  showLabel: string;
  hideLabel: string;
  autoComplete: "current-password" | "new-password" | "off";
  required?: boolean;
} & Omit<React.ComponentProps<typeof Input>, "type" | "autoComplete">;

export const AuthPasswordField = forwardRef<HTMLInputElement, AuthPasswordFieldProps>(function AuthPasswordField(
  { id, label, error, helperText, showLabel, hideLabel, autoComplete, required, className, ...inputProps },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const toggleId = useId();
  const describedBy = [helperText ? `${id}-help` : undefined, error ? `${id}-error` : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-semibold text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required}
          className={cn(
            "min-h-11 rounded-lg border-2 pr-12 text-base md:text-base",
            error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
          {...inputProps}
        />
        <Button
          type="button"
          id={toggleId}
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-11 w-11 min-h-11 min-w-11 -translate-y-1/2 rounded-md text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
          aria-controls={id}
          aria-pressed={visible}
          aria-label={visible ? hideLabel : showLabel}
        >
          {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
        </Button>
      </div>
      {helperText ? (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      ) : null}
      <InlineFieldError id={`${id}-error`} message={error} />
    </div>
  );
});
