import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function AuthCard({ children, className }: Props) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
