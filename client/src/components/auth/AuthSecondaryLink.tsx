import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Props = {
  to: string;
  children: React.ReactNode;
  className?: string;
};

export function AuthSecondaryLink({ to, children, className }: Props) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg px-2 text-base font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {children}
    </Link>
  );
}
