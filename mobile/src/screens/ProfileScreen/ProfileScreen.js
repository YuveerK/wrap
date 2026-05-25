import { Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import * as authApi from "@/api/auth";
import { Loading } from "@/components/Loading/Loading";
import { ErrorView } from "@/components/ErrorView/ErrorView";
import { Screen } from "@/components/Screen/Screen";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/theme";
import { styles } from "./ProfileScreen.styles";

export function ProfileScreen() {
  const { user: storeUser } = useAuth();
  const { colors } = useTheme();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["me"],
    queryFn: authApi.fetchMe,
    initialData: storeUser ?? undefined,
  });

  if (isLoading && !user) {
    return (
      <Screen edges={["bottom"]}>
        <Loading />
      </Screen>
    );
  }

  if (error && !user) {
    return (
      <Screen edges={["bottom"]}>
        <ErrorView
          message={error instanceof Error ? error.message : "Failed to load profile"}
          onRetry={() => refetch()}
        />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen edges={["bottom"]}>
        <ErrorView message="Not signed in" />
      </Screen>
    );
  }

  return (
    <Screen edges={["bottom"]}>
      <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {user.firstName} {user.lastName}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{user.email}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{user.phone}</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {user.streetAddress}, {user.postalCode}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Role: {user.role}</Text>
    </Screen>
  );
}
