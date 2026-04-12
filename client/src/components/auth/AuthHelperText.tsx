import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  children: React.ReactNode;
  className?: string;
};

export function AuthHelperText({ id, children, className }: Props) {
  return (
    <p id={id} className={cn("mt-1.5 text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}
