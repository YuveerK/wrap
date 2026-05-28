import { useState, useEffect } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authApi from "@/api/auth";
import { ErrorView } from "@/components/ErrorView/ErrorView";
import { Loading } from "@/components/Loading/Loading";
import { Screen } from "@/components/Screen/Screen";
import { useAuth } from "@/hooks/useAuth";
import { getAvatarColor, getInitials } from "@/lib/formatRelativeTime";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

const H_PAD = spacing.md + 4;

function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function SettingsRow({ icon, label, detail, lock, onPress, isLast }) {
  const { colors, semantic } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        !isLast && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
        pressed && { opacity: 0.75 },
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: hexAlpha(colors.primary, 0.12) },
        ]}
      >
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.text }]} numberOfLines={1}>
        {label}
      </Text>
      {detail ? (
        <Text style={[styles.rowDetail, { color: colors.textMuted }]}>
          {detail}
        </Text>
      ) : null}
      <Ionicons
        name={lock ? "lock-closed-outline" : "chevron-forward"}
        size={14}
        color={colors.textMuted}
      />
    </Pressable>
  );
}

function SettingsGroup({ label, items }) {
  const { colors, semantic } = useTheme();
  const cardBg = semantic.cardBackground;
  const shadowColor = "#0D1520";

  return (
    <View style={styles.groupWrap}>
      <Text style={[styles.groupLabel, { color: colors.textMuted }]}>{label}</Text>
      <View style={[styles.groupCard, { backgroundColor: cardBg, shadowColor }]}>
        {items.map((item, idx) => (
          <SettingsRow
            key={item.label}
            isLast={idx === items.length - 1}
            {...item}
          />
        ))}
      </View>
    </View>
  );
}

const NOTIF_PREF_KEY = "notif_pref";
const NOTIF_PREF_LABELS = {
  all: "All",
  "pinned+replies": "Pinned + replies",
  off: "Off",
};

export function ProfileScreen() {
  const { user: storeUser, logout } = useAuth();
  const { colors, semantic, preference, setPreference } = useTheme();
  const cardBg = semantic.cardBackground;
  const [notifPref, setNotifPref] = useState("pinned+replies");

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_PREF_KEY).then((val) => {
      if (val && NOTIF_PREF_LABELS[val]) setNotifPref(val);
    });
  }, []);

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

  const handleThemeTap = () => {
    Alert.alert(
      "Appearance",
      "Choose your preferred theme.",
      [
        { text: "System", onPress: () => setPreference("system") },
        { text: "Light", onPress: () => setPreference("light") },
        { text: "Dark", onPress: () => setPreference("dark") },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const handleNotificationPrefs = () => {
    const save = (val) => {
      AsyncStorage.setItem(NOTIF_PREF_KEY, val);
      setNotifPref(val);
    };
    Alert.alert(
      "Push notifications",
      "Choose which notifications you want to receive.",
      [
        { text: "All", onPress: () => save("all") },
        { text: "Pinned + replies", onPress: () => save("pinned+replies") },
        { text: "Off", onPress: () => save("off"), style: "destructive" },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign out of Wrap?",
      "You'll need to sign back in to access your neighbourhood.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign out", style: "destructive", onPress: logout },
      ],
    );
  };

  if (isLoading && !user) {
    return (
      <Screen edges={["top"]} backgroundColor={semantic.feedListBackground}>
        <Loading />
      </Screen>
    );
  }

  if (error && !user) {
    return (
      <Screen edges={["top"]} backgroundColor={semantic.feedListBackground}>
        <ErrorView
          message={error instanceof Error ? error.message : "Failed to load profile"}
          onRetry={() => refetch()}
        />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen edges={["top"]} backgroundColor={semantic.feedListBackground}>
        <ErrorView message="Not signed in" />
      </Screen>
    );
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "You";
  const seed = String(user.id ?? name);
  const avatarBg = getAvatarColor(seed);
  const themeLabel =
    preference === "dark" ? "Dark" : preference === "light" ? "Light" : "System";
  const unit = user.streetAddress ?? user.unit ?? "Unknown unit";

  return (
    <Screen edges={["top"]} padded={false} backgroundColor={semantic.feedListBackground}>
      <ScrollView
        contentContainerStyle={[styles.scroll]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { paddingHorizontal: H_PAD }]}>
          <View style={styles.heroRow}>
            {/* Large avatar */}
            <View style={[styles.avatarRingLg, { borderColor: `${avatarBg}50` }]}>
              <View style={[styles.avatarLg, { backgroundColor: avatarBg }]}>
                <Text style={styles.initialsLg}>
                  {getInitials(user.firstName, user.lastName)}
                </Text>
              </View>
            </View>

            <View style={styles.heroText}>
              <Text style={[styles.heroName, { color: colors.text }]}>
                {name}
              </Text>
              <Text style={[styles.heroUnit, { color: colors.textMuted }]}>
                {`${unit} · Wrap`}
              </Text>
              <Pressable
                style={[
                  styles.editBtn,
                  { backgroundColor: cardBg, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.editBtnText, { color: colors.text }]}>
                  Edit profile
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Stat strip card */}
        <View style={[styles.statCard, { backgroundColor: cardBg, marginHorizontal: H_PAD }]}>
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: colors.text }]}>
              {user.postCount ?? "—"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Posts</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: colors.text }]}>
              {user.replyCount ?? "—"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Replies</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: colors.text }]}>
              {user.issueCount ?? "—"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Reported</Text>
          </View>
        </View>

        {/* Settings groups */}
        <View style={[styles.groups, { paddingHorizontal: H_PAD }]}>
          <SettingsGroup
            label="NOTIFICATIONS"
            items={[
              {
                icon: "notifications-outline",
                label: "Push notifications",
                detail: NOTIF_PREF_LABELS[notifPref] ?? "Pinned + replies",
                onPress: handleNotificationPrefs,
              },
              { icon: "mail-outline", label: "Email digest", detail: "Weekly" },
              { icon: "warning-outline", label: "Safety alerts", detail: "Always on", lock: true },
            ]}
          />
          <SettingsGroup
            label="APPEARANCE"
            items={[
              { icon: "color-palette-outline", label: "Theme", detail: themeLabel, onPress: handleThemeTap },
              { icon: "text-outline", label: "Text size", detail: "Default" },
            ]}
          />
          <SettingsGroup
            label="COMMUNITY"
            items={[
              { icon: "home-outline", label: "My unit", detail: unit },
              { icon: "people-outline", label: "Directory", detail: "Neighbours" },
              { icon: "shield-outline", label: "Privacy & data" },
            ]}
          />
        </View>

        {/* Sign out */}
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutBtn,
            {
              backgroundColor: cardBg,
              borderColor: hexAlpha(colors.danger, 0.3),
              marginHorizontal: H_PAD,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons name="log-out-outline" size={16} color={colors.danger} />
          <Text style={[styles.signOutLabel, { color: colors.danger }]}>
            Sign out
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl * 2,
    gap: spacing.md + 4,
  },
  hero: {
    paddingTop: spacing.md,
  },
  heroRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  avatarRingLg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  initialsLg: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  heroText: {
    flex: 1,
    gap: 3,
  },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  heroUnit: {
    fontSize: 13.5,
    fontWeight: "500",
  },
  editBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 10,
  },
  editBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#0D1520",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
    }),
  },
  statCol: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statNum: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  groups: {
    gap: spacing.md + 4,
  },
  groupWrap: {
    gap: 6,
  },
  groupLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingLeft: 16,
  },
  groupCard: {
    borderRadius: 18,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0D1520",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
    }),
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  rowDetail: {
    fontSize: 13,
    fontWeight: "500",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  signOutLabel: {
    fontSize: 14.5,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
