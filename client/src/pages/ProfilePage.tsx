import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Camera, Trash2, X } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import type { Locale } from "date-fns";
import { toast } from "sonner";
import Navbar from "@/components/landing/Navbar";
import { apiFetch, type ApiError } from "@/lib/api";
import { useCurrentUser, type CurrentUser, type EnglishLevel, type Gender } from "@/lib/useCurrentUser";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS: Gender[] = ["female", "male", "non_binary", "other", "prefer_not_to_say"];
const ENGLISH_LEVELS: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2", "unknown"];
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const PHONE_RE = /^[+()\-\s\d.]{6,40}$/;

const initialsOf = (u: { fullName?: string | null; displayName?: string | null; name: string | null; email: string }) => {
  const source = (u.fullName || u.displayName || u.name || u.email || "?").trim();
  const parts = source.split(/\s+/);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
};

type FormState = {
  fullName: string;
  displayName: string;
  gender: Gender | "";
  birthday: string;
  phone: string;
  englishLevel: EnglishLevel | "";
  address: string;
  language: Language;
};

type Errors = Partial<Record<keyof FormState, string>> & {
  avatar?: string;
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });

const userToForm = (u: CurrentUser): FormState => ({
  fullName: u.fullName ?? "",
  displayName: u.displayName ?? u.fullName ?? u.name ?? "",
  gender: u.gender ?? "",
  birthday: u.birthday ?? "",
  phone: u.phone ?? "",
  englishLevel: u.englishLevel ?? "",
  address: u.address ?? "",
  language: u.language ?? "pt",
});

const normalizedForm = (s: FormState): FormState => ({
  fullName: s.fullName.trim(),
  displayName: s.displayName.trim(),
  gender: s.gender,
  birthday: s.birthday,
  phone: s.phone.trim(),
  englishLevel: s.englishLevel,
  address: s.address.trim(),
  language: s.language,
});

const sameForm = (a: FormState, b: FormState) => {
  const na = normalizedForm(a);
  const nb = normalizedForm(b);
  return (Object.keys(na) as Array<keyof FormState>).every((k) => na[k] === nb[k]);
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { user, loading, setUser } = useCurrentUser();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formReady, setFormReady] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<FormState>({
    fullName: "",
    displayName: "",
    gender: "",
    birthday: "",
    phone: "",
    englishLevel: "",
    address: "",
    language: "pt",
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth/sign-in", { replace: true });
      return;
    }
    if (formReady) return;
    setForm(userToForm(user));
    setFormReady(true);
  }, [loading, user, navigate, formReady]);

  const isDirty = useMemo(() => {
    if (!user) return false;
    return !sameForm(form, userToForm(user));
  }, [form, user]);

  const validate = (s: FormState): Errors => {
    const e: Errors = {};
    if (!s.fullName.trim()) e.fullName = t("profile.err.fullNameRequired");
    if (!s.displayName.trim()) e.displayName = t("profile.err.displayNameRequired");
    if (!s.gender) e.gender = t("profile.err.genderRequired");
    if (!s.birthday) {
      e.birthday = t("profile.err.birthdayRequired");
    } else {
      const bd = new Date(s.birthday + "T00:00:00Z");
      if (Number.isNaN(bd.getTime()) || bd.getTime() >= Date.now()) {
        e.birthday = t("profile.err.birthdayPast");
      }
    }
    if (!s.englishLevel) e.englishLevel = t("profile.err.levelRequired");
    if (s.phone.trim() && !PHONE_RE.test(s.phone.trim())) e.phone = t("profile.err.phoneInvalid");
    return e;
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, avatar: t("profile.err.avatarType") }));
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setErrors((prev) => ({ ...prev, avatar: t("profile.err.avatarSize") }));
      return;
    }
    setErrors((prev) => ({ ...prev, avatar: undefined }));
    setUploadingAvatar(true);
    setBanner(null);
    try {
      const dataUrl = await fileToBase64(file);
      const res = await apiFetch<{ user: CurrentUser }>("/api/auth/me/avatar", {
        method: "POST",
        body: JSON.stringify({ mime: file.type, data: dataUrl }),
      });
      setUser(res.user);
      setBanner({ kind: "ok", msg: t("profile.avatarUpdated") });
    } catch (err) {
      const ae = err as ApiError;
      setBanner({ kind: "err", msg: ae.message || t("profile.saveError") });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onAvatarRemove = async () => {
    setUploadingAvatar(true);
    setBanner(null);
    try {
      const res = await apiFetch<{ user: CurrentUser }>("/api/auth/me/avatar", { method: "DELETE" });
      setUser(res.user);
      setBanner({ kind: "ok", msg: t("profile.avatarRemoved") });
    } catch (err) {
      const ae = err as ApiError;
      setBanner({ kind: "err", msg: ae.message || t("profile.saveError") });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) {
      setBanner({ kind: "err", msg: t("profile.err.fixFields") });
      return;
    }
    setSaving(true);
    setBanner(null);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        displayName: form.displayName.trim(),
        gender: form.gender || null,
        birthday: form.birthday || null,
        phone: form.phone.trim() || null,
        englishLevel: form.englishLevel || null,
        address: form.address.trim() || null,
        language: form.language,
      };
      const res = await apiFetch<{ user: CurrentUser }>("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setUser(res.user);
      setForm(userToForm(res.user));
      if (res.user.language) setLanguage(res.user.language);
      setBanner(null);
      toast.success(t("profile.savedTitle"), { description: t("profile.saved") });
    } catch (err) {
      const ae = err as ApiError;
      const msg = ae.message || t("profile.saveError");
      setBanner(null);
      toast.error(t("profile.saveErrorTitle"), { description: msg });
    } finally {
      setSaving(false);
    }
  };

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto max-w-2xl px-4">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-6">{t("profile.title")}</h1>

          {loading || !user ? (
            <div className="text-sm text-muted-foreground">{t("profile.loading")}</div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-8">
              {/* Avatar */}
              <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-base font-bold mb-4">{t("profile.avatar")}</h2>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                      {initialsOf(user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploadingAvatar}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {user.avatarUrl ? t("profile.avatarReplace") : t("profile.avatarUpload")}
                      </Button>
                      {user.avatarUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={onAvatarRemove}
                          disabled={uploadingAvatar}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t("profile.avatarRemove")}
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{t("profile.avatarHelper")}</p>
                    {errors.avatar ? (
                      <p className="text-xs text-destructive">{errors.avatar}</p>
                    ) : null}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept={AVATAR_TYPES.join(",")}
                    className="hidden"
                    onChange={onAvatarChange}
                  />
                </div>
              </section>

              {banner && (
                <div
                  role="status"
                  className={
                    banner.kind === "ok"
                      ? "rounded-md border border-green-300 bg-green-50 text-green-700 px-3 py-2 text-sm"
                      : "rounded-md border border-destructive/30 bg-destructive/10 text-destructive px-3 py-2 text-sm"
                  }
                >
                  {banner.msg}
                </div>
              )}

              {/* Identity */}
              <section className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
                <h2 className="text-base font-bold">{t("profile.identity")}</h2>

                <Field
                  id="profile-fullName"
                  label={t("profile.fullName")}
                  required
                  error={errors.fullName}
                >
                  <Input
                    id="profile-fullName"
                    value={form.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                    autoComplete="name"
                    aria-invalid={errors.fullName ? true : undefined}
                  />
                </Field>

                <Field
                  id="profile-displayName"
                  label={t("profile.displayName")}
                  required
                  error={errors.displayName}
                >
                  <Input
                    id="profile-displayName"
                    value={form.displayName}
                    onChange={(e) => setField("displayName", e.target.value)}
                    autoComplete="nickname"
                    aria-invalid={errors.displayName ? true : undefined}
                  />
                </Field>

                <Field id="profile-gender" label={t("profile.gender")} required error={errors.gender}>
                  <RadioGroup
                    value={form.gender}
                    onValueChange={(v) => setField("gender", v as Gender)}
                    aria-invalid={errors.gender ? true : undefined}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                  >
                    {GENDER_OPTIONS.map((g) => (
                      <label
                        key={g}
                        htmlFor={`gender-${g}`}
                        className="flex items-center gap-2 rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-accent/50"
                      >
                        <RadioGroupItem id={`gender-${g}`} value={g} />
                        <span className="text-sm">{t(`profile.gender.${g}`)}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </Field>

                <Field id="profile-birthday" label={t("profile.birthday")} required error={errors.birthday}>
                  <BirthdayPicker
                    id="profile-birthday"
                    value={form.birthday}
                    onChange={(v) => setField("birthday", v)}
                    placeholder={t("profile.birthdayPlaceholder")}
                    clearLabel={t("profile.birthdayClear")}
                    invalid={Boolean(errors.birthday)}
                    locale={language === "pt" ? ptBR : enUS}
                  />
                </Field>

                <Field id="profile-englishLevel" label={t("profile.englishLevel")} required error={errors.englishLevel}>
                  <Select
                    value={form.englishLevel}
                    onValueChange={(v) => setField("englishLevel", v as EnglishLevel)}
                  >
                    <SelectTrigger id="profile-englishLevel" aria-invalid={errors.englishLevel ? true : undefined}>
                      <SelectValue placeholder={t("profile.englishLevelPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {ENGLISH_LEVELS.map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>
                          {t(`profile.englishLevel.${lvl}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field id="profile-phone" label={t("profile.phone")} error={errors.phone} helper={t("profile.phoneHelper")}>
                  <Input
                    id="profile-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="+55 11 91234-5678"
                    aria-invalid={errors.phone ? true : undefined}
                  />
                </Field>

                <Field id="profile-email" label={t("profile.email")}>
                  <Input id="profile-email" value={user.email} readOnly disabled />
                </Field>
              </section>

              <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <Field
                  id="profile-language"
                  label={t("profile.language")}
                  helper={t("profile.language.helper")}
                >
                  <Select
                    value={form.language}
                    onValueChange={(v) => {
                      const lang = v as Language;
                      setField("language", lang);
                      setLanguage(lang);
                    }}
                  >
                    <SelectTrigger id="profile-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">{t("profile.language.pt")}</SelectItem>
                      <SelectItem value="en">{t("profile.language.en")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </section>

              <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <Field
                  id="profile-address"
                  label={t("profile.homeAddress")}
                  helper={t("profile.optional")}
                  error={errors.address}
                >
                  <Input
                    id="profile-address"
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    autoComplete="street-address"
                    maxLength={500}
                    aria-invalid={errors.address ? true : undefined}
                  />
                </Field>
              </section>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                  {t("profile.cancel")}
                </Button>
                <Button type="submit" disabled={saving || !isDirty}>
                  {saving ? t("profile.saving") : t("profile.save")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
};

const Field = ({
  id,
  label,
  required,
  error,
  helper,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  helper?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-sm font-semibold">
      {label}
      {required ? <span className="text-destructive"> *</span> : null}
    </Label>
    {children}
    {error ? (
      <p id={`${id}-error`} className="text-xs text-destructive">
        {error}
      </p>
    ) : helper ? (
      <p id={`${id}-help`} className="text-xs text-muted-foreground">
        {helper}
      </p>
    ) : null}
  </div>
);

const BIRTHDAY_DISPLAY_FORMAT = "dd/MM/yyyy";

const BirthdayPicker = ({
  id,
  value,
  onChange,
  placeholder,
  clearLabel,
  invalid,
  locale,
}: {
  id: string;
  value: string;
  onChange: (iso: string) => void;
  placeholder: string;
  clearLabel: string;
  invalid?: boolean;
  locale: Locale;
}) => {
  const [open, setOpen] = useState(false);
  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const safeSelected = selected && isValid(selected) ? selected : undefined;
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          aria-invalid={invalid ? true : undefined}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
            "ring-offset-background hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            invalid && "border-destructive focus-visible:ring-destructive",
            !safeSelected && "text-muted-foreground",
          )}
        >
          <span className="truncate">
            {safeSelected ? format(safeSelected, BIRTHDAY_DISPLAY_FORMAT, { locale }) : placeholder}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            {safeSelected ? (
              <span
                role="button"
                tabIndex={0}
                aria-label={clearLabel}
                className="p-0.5 rounded hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange("");
                  }
                }}
              >
                <X className="w-3.5 h-3.5" />
              </span>
            ) : null}
            <CalendarIcon className="w-4 h-4" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={locale}
          selected={safeSelected}
          defaultMonth={safeSelected ?? new Date(today.getFullYear() - 25, today.getMonth(), 1)}
          captionLayout="dropdown-buttons"
          fromYear={1900}
          toYear={today.getFullYear()}
          disabled={{ after: today }}
          onSelect={(d) => {
            if (d) {
              onChange(format(d, "yyyy-MM-dd"));
              setOpen(false);
            }
          }}
          initialFocus
          classNames={{
            caption_label: "hidden",
            caption_dropdowns: "flex items-center justify-center gap-1.5 w-full",
            vhidden: "sr-only",
            dropdown:
              "h-8 rounded-md border border-input bg-background pl-2 pr-1 text-sm font-semibold cursor-pointer hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            dropdown_month: "relative",
            dropdown_year: "relative",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default ProfilePage;
