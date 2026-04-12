import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthHelperText } from "./AuthHelperText";

type Item = { key: string; label: string; onClick?: () => void };

type Props = {
  items: Item[];
  helper?: string;
  className?: string;
};

function GoogleIcon() {
  return (
    <svg aria-hidden className="size-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg aria-hidden className="size-5 shrink-0 fill-foreground" viewBox="0 0 24 24">
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.975 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.276-3.01.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.06.91-3.64.91-1.52 0-2.492-1.27-3.488-2.64C1.713 15.73 0 13.15 0 10.62 0 6.93 2.052 5.02 4.782 5.02c1.214 0 2.165.67 3.088.67.91 0 2.208-.71 3.82-.71.614 0 2.886.06 4.374 2.43-.11.08-2.607 1.52-2.607 4.47 0 3.79 3.263 5.1 3.388 5.13-.016.05-.387 1.32-1.365 2.59z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden className="size-5 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const icons: Record<string, React.ReactNode> = {
  google: <GoogleIcon />,
  apple: <AppleIcon />,
  facebook: <FacebookIcon />,
};

export function AuthSocialButtons({ items, helper, className }: Props) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <Button
            key={item.key}
            type="button"
            variant="outline"
            className="h-11 min-h-11 w-full justify-center gap-2 border-2 text-base font-bold"
            onClick={item.onClick}
          >
            {icons[item.key]}
            {item.label}
          </Button>
        ))}
      </div>
      {helper ? <AuthHelperText>{helper}</AuthHelperText> : null}
    </div>
  );
}
