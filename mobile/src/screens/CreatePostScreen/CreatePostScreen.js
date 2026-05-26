import { useState, useRef } from "react";
import {
  Alert,
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
} from "react-native";
import { LocationPickerModal } from "./LocationPickerModal";
import { KeyboardAwareScrollView } from "@/components/KeyboardAwareScrollView/KeyboardAwareScrollView";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import * as postsApi from "@/api/posts";
import { ApiError } from "@/api/client";
import { Screen } from "@/components/Screen/Screen";
import { appendUploadFile } from "@/lib/normalizeUploadFile";
import { createPostSchema } from "@/lib/validation/postSchemas";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";

function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const CATEGORIES = [
  { label: "Notices", value: "NOTICES" },
  { label: "Safety", value: "SAFETY" },
  { label: "Events", value: "EVENTS" },
  { label: "Lost & Found", value: "LOST_AND_FOUND" },
  { label: "Recommendations", value: "RECOMMENDATIONS" },
];

/** Simple toggle that mimics iOS style */
function PinToggle({ value, onChange, colors }) {
  const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;

  const toggle = () => {
    const next = !value;
    Animated.spring(translateX, {
      toValue: next ? 20 : 0,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
    onChange(next);
  };

  return (
    <Pressable
      onPress={toggle}
      style={[
        styles.toggleTrack,
        { backgroundColor: value ? colors.primary : colors.border },
      ]}
    >
      <Animated.View
        style={[styles.toggleThumb, { transform: [{ translateX }] }]}
      />
    </Pressable>
  );
}

export function CreatePostScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { colors, semantic } = useTheme();
  const { user } = useAuth();
  const [formError, setFormError] = useState("");
  const [pinned, setPinned] = useState(false);
  const [banner, setBanner] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPostSchema),
    defaultValues: { title: "", body: "", category: "NOTICES" },
  });

  const titleValue = watch("title");
  const bodyValue = watch("body");
  const canPost = (titleValue?.trim().length ?? 0) >= 1 || (bodyValue?.trim().length ?? 0) >= 1;
  const categoryValue = watch("category");

  const pickBanner = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const rawName = asset.fileName ?? `banner-${Date.now()}`;
      const name = /\.[a-z0-9]+$/i.test(rawName) ? rawName : `${rawName}.jpg`;
      setBanner({ uri: asset.uri, name, type: asset.mimeType ?? "image/jpeg" });
    }
  };

  const mutation = useMutation({
    mutationFn: async (values) => {
      const form = new FormData();
      if (values.title?.trim()) form.append("title", values.title.trim());
      form.append("body", values.body.trim());
      form.append("category", values.category ?? "NOTICES");
      if (location?.addressText) form.append("addressText", location.addressText);
      if (location?.latitude != null) form.append("latitude", String(location.latitude));
      if (location?.longitude != null) form.append("longitude", String(location.longitude));
      if (banner) await appendUploadFile(form, "banner", banner);
      return postsApi.createPostWithMedia(form);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigation.goBack();
    },
    onError: (err) => {
      setFormError(
        err instanceof ApiError ? err.message : err?.message ?? "Could not create post",
      );
    },
  });

  const isCommittee = user?.role === "COMMITTEE" || user?.role === "ADMIN";
  const isPending = mutation.isPending;

  const handleBack = () => {
    if (titleValue?.trim() || bodyValue?.trim()) {
      Alert.alert("Discard post?", "Your draft will be lost.", [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.goBack();
    }
  };

  const cardBg = semantic.cardBackground;

  return (
    <Screen edges={["top", "bottom"]} padded={false}>
      {/* Custom header */}
      <View
        style={[
          styles.header,
          { backgroundColor: cardBg, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New post</Text>
        <Pressable
          onPress={handleSubmit((v) => mutation.mutate(v))}
          disabled={isPending || !canPost}
          style={[
            styles.postBtn,
            {
              backgroundColor: canPost && !isPending
                ? colors.primary
                : hexAlpha(colors.primary, 0.4),
            },
          ]}
        >
          <Text style={styles.postBtnText}>
            {isPending ? "Posting…" : "Post"}
          </Text>
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category chips */}
        <View>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            CATEGORY
          </Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { value, onChange } }) => (
              <View style={styles.chipRow}>
                {CATEGORIES.map((opt) => {
                  const active = value === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => onChange(opt.value)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? colors.primary : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: active ? "#FFF" : colors.text },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
        </View>

        {/* Title input */}
        <Controller
          control={control}
          name="title"
          render={({ field: { value, onChange, onBlur } }) => (
            <View style={[styles.titleWrap, { borderBottomColor: colors.border }]}>
              <RNTextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Say it clearly…"
                placeholderTextColor={colors.textMuted}
                style={[styles.titleInput, { color: colors.text }]}
                returnKeyType="next"
              />
            </View>
          )}
        />

        {/* Body input */}
        <Controller
          control={control}
          name="body"
          render={({ field: { value, onChange, onBlur } }) => (
            <RNTextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Add details so neighbours know what to do…"
              placeholderTextColor={colors.textMuted}
              style={[styles.bodyInput, { color: semantic.postBodyText }]}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          )}
        />

        {/* Toolbar chips */}
        <View style={styles.toolbar}>
          <Pressable onPress={pickBanner} style={[styles.toolChip, { borderColor: colors.border }]}>
            <Ionicons name="camera-outline" size={15} color={colors.text} />
            <Text style={[styles.toolChipText, { color: colors.text }]}>Photo</Text>
          </Pressable>
          <Pressable
            onPress={() => setLocationModalVisible(true)}
            style={[
              styles.toolChip,
              {
                borderColor: location ? colors.primary : colors.border,
                backgroundColor: location ? hexAlpha(colors.primary, 0.08) : "transparent",
              },
            ]}
          >
            <Ionicons
              name={location ? "location" : "location-outline"}
              size={15}
              color={location ? colors.primary : colors.text}
            />
            <Text style={[styles.toolChipText, { color: location ? colors.primary : colors.text }]}>
              {location ? "Location set" : "Location"}
            </Text>
          </Pressable>
        </View>

        {/* Location preview */}
        {location ? (
          <View
            style={[
              styles.locationPreview,
              { backgroundColor: hexAlpha(colors.primary, 0.08), borderColor: hexAlpha(colors.primary, 0.2) },
            ]}
          >
            <Ionicons name="location" size={15} color={colors.primary} />
            <Text style={[styles.locationPreviewText, { color: colors.text }]} numberOfLines={1}>
              {location.addressText}
            </Text>
            <Pressable onPress={() => setLocation(null)} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        ) : null}

        <LocationPickerModal
          visible={locationModalVisible}
          onConfirm={(loc) => {
            setLocation(loc);
            setLocationModalVisible(false);
          }}
          onClose={() => setLocationModalVisible(false)}
        />

        {/* Banner preview */}
        {banner ? (
          <View style={styles.bannerWrap}>
            <Image source={{ uri: banner.uri }} style={styles.bannerPreview} />
            <Pressable
              onPress={() => setBanner(null)}
              style={[styles.bannerRemove, { backgroundColor: cardBg }]}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={26} color={colors.danger} />
            </Pressable>
          </View>
        ) : null}

        {/* Pin card (committee only) */}
        {isCommittee ? (
          <View
            style={[
              styles.pinCard,
              { backgroundColor: cardBg, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.pinIconBg,
                { backgroundColor: hexAlpha(colors.primary, 0.14) },
              ]}
            >
              <Ionicons name="pin" size={18} color={colors.primary} />
            </View>
            <View style={styles.pinText}>
              <Text style={[styles.pinTitle, { color: colors.text }]}>
                Pin to top
              </Text>
              <Text style={[styles.pinSub, { color: colors.textMuted }]}>
                Committee only · Pinned posts stay at the top for 24 h
              </Text>
            </View>
            <PinToggle value={pinned} onChange={setPinned} colors={colors} />
          </View>
        ) : null}

        {formError ? (
          <Text style={[styles.formError, { color: colors.danger }]}>
            {formError}
          </Text>
        ) : null}
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  postBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  postBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.sm + 4,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  titleWrap: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  bodyInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
  },
  toolbar: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  toolChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  toolChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  locationPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  locationPreviewText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  bannerWrap: {
    borderRadius: 14,
    overflow: "hidden",
  },
  bannerPreview: {
    width: "100%",
    height: 180,
  },
  bannerRemove: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 13,
  },
  pinCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
  },
  pinIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pinText: {
    flex: 1,
    gap: 3,
  },
  pinTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  pinSub: {
    fontSize: 12.5,
  },
  toggleTrack: {
    width: 42,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  formError: {
    fontSize: 14,
    fontWeight: "500",
  },
});
