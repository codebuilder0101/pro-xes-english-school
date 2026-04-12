import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { InlineFieldError } from "./InlineFieldError";

export type AuthTextFieldProps = {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  optionalHint?: string;
} & React.ComponentProps<typeof Input>;

export const AuthTextField = forwardRef<HTMLInputElement, AuthTextFieldProps>(function AuthTextField(
  { id, label, error, helperText, required, optionalHint, className, ...inputProps },
  ref,
) {
  const describedBy = [helperText ? `${id}-help` : undefined, error ? `${id}-error` : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Label htmlFor={id} className="text-base font-semibold text-foreground">
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
        {optionalHint ? <span className="text-sm text-muted-foreground">{optionalHint}</span> : null}
      </div>
      <Input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required}
        className={cn(
          "min-h-11 rounded-lg border-2 text-base md:text-base",
          error && "border-destructive focus-visible:ring-destructive",
          className,
        )}
        {...inputProps}
      />
      {helperText ? (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      ) : null}
      <InlineFieldError id={`${id}-error`} message={error} />
    </div>
  );
});
