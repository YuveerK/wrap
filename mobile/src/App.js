import "react-native-gesture-handler";
import { useMemo } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import { useThemeBootstrap } from "@/hooks/useThemeBootstrap";
import { linking } from "@/navigation/linking";
import { RootNavigator } from "@/navigation/RootNavigator";
import { useTheme } from "@/theme";
import { buildNavigationTheme } from "@/theme/navigationTheme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

function AppShell() {
  useThemeBootstrap();
  const { colors, scheme, isDark } = useTheme();
  const navigationTheme = useMemo(
    () => buildNavigationTheme(scheme, colors),
    [scheme, colors],
  );

  return (
    <>
      <NavigationContainer linking={linking} theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AppShell />
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
