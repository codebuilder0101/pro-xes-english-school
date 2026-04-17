import { useCallback, useEffect, useState } from "react";
import { apiFetch, type ApiError } from "./api";
import { clearAccessToken } from "./session";

export type Gender = "female" | "male" | "non_binary" | "other" | "prefer_not_to_say";
export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "unknown";

export type Address = {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
};

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
  address: Address | null;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiFetch<{ user: CurrentUser }>("/api/auth/me")
      .then((res) => {
        if (!cancelled) setUser(res.user);
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
  }, []);

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

  return { user, loading, signOut };
}
