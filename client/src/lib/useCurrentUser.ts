import { useCallback, useEffect, useState } from "react";
import { apiFetch, type ApiError } from "./api";
import { clearAccessToken, getAccessToken } from "./session";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  flag: string;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!getAccessToken());

  useEffect(() => {
    let cancelled = false;
    if (!getAccessToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
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

  const signOut = useCallback(() => {
    clearAccessToken();
    setUser(null);
    window.location.href = "/";
  }, []);

  return { user, loading, signOut };
}
