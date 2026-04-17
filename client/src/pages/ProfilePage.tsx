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
import { Camera, Trash2 } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import { apiFetch, type ApiError } from "@/lib/api";
import type {
  Address,
  CurrentUser,
  EnglishLevel,
  Gender,
} from "@/lib/useCurrentUser";
import { useLanguage } from "@/i18n/LanguageContext";

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

const emptyAddress: Address = { street: "", city: "", state: "", postalCode: "", country: "" };

type FormState = {
  fullName: string;
  displayName: string;
  gender: Gender | "";
  birthday: string;
  phone: string;
  englishLevel: EnglishLevel | "";
  address: Address;
};

type Errors = Partial<Record<keyof FormState, string>> & {
  street?: string;
  city?: string;
  country?: string;
  avatar?: string;
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<FormState>({
    fullName: "",
    displayName: "",
    gender: "",
    birthday: "",
    phone: "",
    englishLevel: "",
    address: { ...emptyAddress },
  });

  useEffect(() => {
    apiFetch<{ user: CurrentUser }>("/api/auth/me")
      .then((res) => {
        setUser(res.user);
        setForm({
          fullName: res.user.fullName ?? "",
          displayName: res.user.displayName ?? res.user.name ?? "",
          gender: res.user.gender ?? "",
          birthday: res.user.birthday ?? "",
          phone: res.user.phone ?? "",
          englishLevel: res.user.englishLevel ?? "",
          address: res.user.address
            ? {
                street: res.user.address.street ?? "",
                city: res.user.address.city ?? "",
                state: res.user.address.state ?? "",
                postalCode: res.user.address.postalCode ?? "",
                country: res.user.address.country ?? "",
              }
            : { ...emptyAddress },
        });
      })
      .catch(() => navigate("/auth/sign-in", { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

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

    const addr = s.address;
    const anyAddr = addr.street || addr.city || addr.state || addr.postalCode || addr.country;
    if (anyAddr) {
      if (!addr.street.trim()) e.street = t("profile.err.streetRequired");
      if (!addr.city.trim()) e.city = t("profile.err.cityRequired");
      if (!addr.country.trim()) e.country = t("profile.err.countryRequired");
    } else {
      e.street = t("profile.err.streetRequired");
      e.city = t("profile.err.cityRequired");
      e.country = t("profile.err.countryRequired");
    }
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
        address: {
          street: form.address.street.trim(),
          city: form.address.city.trim(),
          state: form.address.state?.trim() || "",
          postalCode: form.address.postalCode?.trim() || "",
          country: form.address.country.trim(),
        },
      };
      const res = await apiFetch<{ user: CurrentUser }>("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setUser(res.user);
      setBanner({ kind: "ok", msg: t("profile.saved") });
    } catch (err) {
      const ae = err as ApiError;
      setBanner({ kind: "err", msg: ae.message || t("profile.saveError") });
    } finally {
      setSaving(false);
    }
  };

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const setAddr = (k: keyof Address, v: string) =>
    setForm((prev) => ({ ...prev, address: { ...prev.address, [k]: v } }));

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
                  <Input
                    id="profile-birthday"
                    type="date"
                    max={todayISO}
                    value={form.birthday}
                    onChange={(e) => setField("birthday", e.target.value)}
                    aria-invalid={errors.birthday ? true : undefined}
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

              {/* Address */}
              <fieldset className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <legend className="text-base font-bold px-1">{t("profile.homeAddress")}</legend>
                <div className="space-y-5 mt-3">
                  <Field id="addr-street" label={t("profile.street")} required error={errors.street}>
                    <Input
                      id="addr-street"
                      value={form.address.street}
                      onChange={(e) => setAddr("street", e.target.value)}
                      autoComplete="street-address"
                      aria-invalid={errors.street ? true : undefined}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field id="addr-city" label={t("profile.city")} required error={errors.city}>
                      <Input
                        id="addr-city"
                        value={form.address.city}
                        onChange={(e) => setAddr("city", e.target.value)}
                        autoComplete="address-level2"
                        aria-invalid={errors.city ? true : undefined}
                      />
                    </Field>
                    <Field id="addr-state" label={t("profile.state")} helper={t("profile.optional")}>
                      <Input
                        id="addr-state"
                        value={form.address.state ?? ""}
                        onChange={(e) => setAddr("state", e.target.value)}
                        autoComplete="address-level1"
                      />
                    </Field>
                    <Field id="addr-postal" label={t("profile.postalCode")} helper={t("profile.optional")}>
                      <Input
                        id="addr-postal"
                        value={form.address.postalCode ?? ""}
                        onChange={(e) => setAddr("postalCode", e.target.value)}
                        autoComplete="postal-code"
                      />
                    </Field>
                    <Field id="addr-country" label={t("profile.country")} required error={errors.country}>
                      <Input
                        id="addr-country"
                        value={form.address.country}
                        onChange={(e) => setAddr("country", e.target.value)}
                        autoComplete="country-name"
                        aria-invalid={errors.country ? true : undefined}
                      />
                    </Field>
                  </div>
                </div>
              </fieldset>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                  {t("profile.cancel")}
                </Button>
                <Button type="submit" disabled={saving}>
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

export default ProfilePage;
