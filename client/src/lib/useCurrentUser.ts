import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, type ApiError } from "./api";
import { clearAccessToken } from "./session";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";

export type Gender = "female" | "male" | "non_binary" | "other" | "prefer_not_to_say";
export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "unknown";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  flag: string;
  fullName: string | null;
  displayName: string | null;
  gender: Gender | null;
  birthday: string | null;
  avatarUrl: string | null;
  phone: string | null;
  englishLevel: EnglishLevel | null;
  address: string | null;
  language: Language | null;
};

type CurrentUserContextValue = {
  user: CurrentUser | null;
  loading: boolean;
  setUser: (user: CurrentUser | null) => void;
  signOut: () => Promise<void>;
};

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const { setLanguage } = useLanguage();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch<{ user: CurrentUser }>("/api/auth/me")
      .then((res) => {
        if (cancelled) return;
        setUser(res.user);
        if (res.user.language) setLanguage(res.user.language);
      })
      .catch((e) => {
        const err = e as ApiError;
        if (err.status === 401) clearAccessToken();
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setLanguage]);

  const signOut = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* clear client state regardless */
    }
    clearAccessToken();
    setUser(null);
    window.location.href = "/";
  }, []);

  const value = useMemo<CurrentUserContextValue>(
    () => ({ user, loading, setUser, signOut }),
    [user, loading, signOut],
  );

  return createElement(CurrentUserContext.Provider, { value }, children);
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return ctx;
}
