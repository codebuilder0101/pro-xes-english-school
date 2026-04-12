import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  message?: string;
  className?: string;
};

export function InlineFieldError({ id, message, className }: Props) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className={cn("mt-1.5 flex items-start gap-1.5 text-sm text-destructive", className)}>
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  );
}
