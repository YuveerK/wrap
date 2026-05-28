import "react-native-gesture-handler";
import { useMemo, useEffect } from "react";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import { useThemeBootstrap } from "@/hooks/useThemeBootstrap";
import { linking } from "@/navigation/linking";
import { RootNavigator } from "@/navigation/RootNavigator";
import { useTheme } from "@/theme";
import { buildNavigationTheme } from "@/theme/navigationTheme";
import { useNotificationsStore } from "@/store/notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
  const navigationRef = useNavigationContainerRef();
  const setHasUnread = useNotificationsStore((s) => s.setHasUnread);

  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      setHasUnread(true);
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data ?? {};
        const { screen, id } = data;

        if (screen === "PostDetail" && id) {
          navigationRef.current?.navigate("Main", {
            screen: "FeedTab",
            params: { screen: "PostDetail", params: { postId: id } },
          });
        } else if (screen === "IssueDetail" && id) {
          navigationRef.current?.navigate("Main", {
            screen: "IssuesTab",
            params: { screen: "IssueDetail", params: { issueId: id } },
          });
        }
      },
    );

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [navigationRef, setHasUnread]);

  return (
    <>
      <NavigationContainer ref={navigationRef} linking={linking} theme={navigationTheme}>
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
