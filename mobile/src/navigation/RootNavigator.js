import { useAuth } from "@/hooks/useAuth";
import { SplashScreen } from "@/screens/SplashScreen/SplashScreen";
import { AppNavigator } from "./AppNavigator";
import { AuthNavigator } from "./AuthNavigator";

export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
}
