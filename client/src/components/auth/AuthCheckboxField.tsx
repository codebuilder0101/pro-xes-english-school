import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { InlineFieldError } from "./InlineFieldError";

type Props = {
  id: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  error?: string;
  children: React.ReactNode;
  disabled?: boolean;
};

export function AuthCheckboxField({ id, checked, onCheckedChange, error, children, disabled }: Props) {
  return (
    <div>
      <div className="flex gap-3 rounded-lg border border-transparent p-1">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-1 size-5 min-h-5 min-w-5"
        />
        <label htmlFor={id} className={cn("min-h-11 flex-1 cursor-pointer text-base leading-snug text-foreground")}>
          {children}
        </label>
      </div>
      <InlineFieldError id={`${id}-error`} message={error} />
    </div>
  );
}
