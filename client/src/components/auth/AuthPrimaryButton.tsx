import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = ButtonProps & {
  loading?: boolean;
  loadingLabel?: string;
};

export function AuthPrimaryButton({ loading, loadingLabel, children, className, disabled, type = "submit", ...props }: Props) {
  return (
    <Button
      variant="default"
      disabled={disabled || loading}
      className={cn("min-h-11 w-full text-base font-bold", className)}
      aria-busy={loading || undefined}
      {...props}
      type={type}
    >
      {loading ? (
        <>
          <Loader2 className="size-5 animate-spin" aria-hidden />
          <span>{loadingLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
