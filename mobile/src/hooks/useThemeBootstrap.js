import { useEffect } from "react";
import { useThemeStore } from "@/store/theme";

export function useThemeBootstrap() {
  const hydrate = useThemeStore((s) => s.hydrate);
  const isHydrated = useThemeStore((s) => s.isHydrated);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return isHydrated;
}
