import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AuthPasswordField } from "./AuthPasswordField";
import { useLanguage } from "@/i18n/LanguageContext";

export function AuthSecurityModals() {
  const { t } = useLanguage();
  const [sessionOpen, setSessionOpen] = useState(false);
  const [reauthOpen, setReauthOpen] = useState(false);
  const [suspiciousOpen, setSuspiciousOpen] = useState(false);

  return (
    <details className="mt-8 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm">
      <summary className="cursor-pointer font-bold text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
        {t("auth.security.openDemo")}
      </summary>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="min-h-11">
              {t("auth.session.title")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("auth.session.title")}</DialogTitle>
              <DialogDescription>{t("auth.session.body")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" className="min-h-11 w-full sm:w-auto" onClick={() => setSessionOpen(false)}>
                {t("auth.session.signIn")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={reauthOpen} onOpenChange={setReauthOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="min-h-11">
              {t("auth.reauth.title")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("auth.reauth.title")}</DialogTitle>
              <DialogDescription>{t("auth.reauth.body")}</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setReauthOpen(false);
              }}
            >
              <AuthPasswordField
                id="reauth-password"
                name="password"
                label={t("auth.signIn.passwordLabel")}
                showLabel={t("auth.signIn.showPassword")}
                hideLabel={t("auth.signIn.hidePassword")}
                autoComplete="current-password"
                required
              />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="ghost" className="min-h-11" onClick={() => setReauthOpen(false)}>
                  {t("auth.reauth.cancel")}
                </Button>
                <Button type="submit" className="min-h-11">
                  {t("auth.reauth.submit")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={suspiciousOpen} onOpenChange={setSuspiciousOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="min-h-11">
              {t("auth.suspicious.title")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("auth.suspicious.title")}</DialogTitle>
              <DialogDescription>{t("auth.suspicious.body")}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" className="min-h-11 w-full sm:w-auto" onClick={() => setSuspiciousOpen(false)}>
                {t("auth.otp.verify")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </details>
  );
}
