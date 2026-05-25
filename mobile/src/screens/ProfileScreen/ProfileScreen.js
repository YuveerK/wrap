import { ScrollView, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import * as authApi from "@/api/auth";
import { AppearanceToggle } from "@/components/AppearanceToggle/AppearanceToggle";
import { Button } from "@/components/Button/Button";
import { Loading } from "@/components/Loading/Loading";
import { ErrorView } from "@/components/ErrorView/ErrorView";
import { Screen } from "@/components/Screen/Screen";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/theme";
import { styles } from "./ProfileScreen.styles";

export function ProfileScreen() {
  const { user: storeUser, logout } = useAuth();
  const { colors, scheme } = useTheme();

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

  const schemeLabel =
    scheme === "dark" ? "Dark mode active" : "Light mode active";

  return (
    <Screen edges={["bottom"]} padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.name, { color: colors.text }]}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {user.email}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {user.phone}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {user.streetAddress}, {user.postalCode}
          </Text>
          <Text style={[styles.role, { color: colors.primary }]}>
            {user.role}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            Appearance
          </Text>
          <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
            {schemeLabel}. Choose System to follow your device setting.
          </Text>
          <AppearanceToggle />
        </View>

        <Button title="Sign out" onPress={logout} variant="secondary" />
      </ScrollView>
    </Screen>
  );
}
