import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { to: string; children: React.ReactNode; className?: string };

export function AuthBackLink({ to, children, className }: Props) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex min-h-11 items-center gap-1 text-sm font-bold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1",
        className,
      )}
    >
      <ChevronLeft className="size-4 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}
