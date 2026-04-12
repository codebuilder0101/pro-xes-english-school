import { cn } from "@/lib/utils";

type Props = { label: string; className?: string };

export function AuthDivider({ label, className }: Props) {
  return (
    <div className={cn("flex items-center gap-3", className)} role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
