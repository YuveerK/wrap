import { useCallback, useEffect } from "react";
import * as authApi from "@/api/auth";
import * as communitiesApi from "@/api/communities";
import {
  clearAuthTokens,
  getAuthToken,
  getRefreshToken,
  saveAuthTokens,
} from "@/lib/auth";
import { useAuthStore } from "@/store/auth";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const logoutStore = useAuthStore((s) => s.logout);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const accessToken = await getAuthToken();
        if (!accessToken) return;

        const me = await authApi.fetchMe();
        if (!cancelled) {
          setUser(me);
          try {
            await communitiesApi.fetchCurrentCommunity();
          } catch {
            // Community assignment is best-effort on hydrate
          }
        }
      } catch {
        if (!cancelled) {
          await clearAuthTokens();
          logoutStore();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [setUser, setLoading, logoutStore]);

  const setSession = useCallback(
    async ({ accessToken, refreshToken, user: sessionUser }) => {
      await saveAuthTokens(accessToken, refreshToken);
      setUser(sessionUser);
      try {
        await communitiesApi.fetchCurrentCommunity();
      } catch {
        // Community assignment is best-effort on login
      }
    },
    [setUser],
  );

  const logout = useCallback(async () => {
    const refreshToken = await getRefreshToken();
    try {
      await authApi.logout(refreshToken);
    } catch {
      // Clear local session even if server logout fails
    }
    await clearAuthTokens();
    logoutStore();
  }, [logoutStore]);

  return { user, isLoading, setSession, logout };
}
