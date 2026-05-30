import { useState, useRef } from "react";
import {
  Alert,
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
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
import { getAvatarColor, getInitials } from "@/lib/formatRelativeTime";
import { MediaGrid } from "@/components/MediaGrid/MediaGrid";

function hexAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const H_PAD      = spacing.md + 4; // 20 px — matches card padding throughout app
const BODY_MAX   = 2000;
const MAX_IMAGES = 4;

const CATEGORIES = [
  { label: "Notices",         value: "NOTICES",         icon: "megaphone" },
  { label: "Safety",          value: "SAFETY",          icon: "shield-checkmark" },
  { label: "Events",          value: "EVENTS",          icon: "calendar" },
  { label: "Lost & Found",    value: "LOST_AND_FOUND",  icon: "search" },
  { label: "Recommendations", value: "RECOMMENDATIONS", icon: "thumbs-up" },
];

function PinToggle({ value, onChange, colors }) {
  const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;

  const toggle = () => {
    const next = !value;
    Animated.spring(translateX, {
      toValue: next ? 20 : 0,
      useNativeDriver: true,
      tension: 400,
      friction: 20,
    }).start();
    onChange(next);
  };

  return (
    <Pressable
      onPress={toggle}
      style={[styles.toggleTrack, { backgroundColor: value ? colors.primary : colors.border }]}
    >
      <Animated.View style={[styles.toggleThumb, { transform: [{ translateX }] }]} />
    </Pressable>
  );
}

export function CreatePostScreen() {
  const navigation   = useNavigation();
  const queryClient  = useQueryClient();
  const { colors, semantic, scheme } = useTheme();
  const { user }     = useAuth();

  const [formError,            setFormError]            = useState("");
  const [pinned,               setPinned]               = useState(false);
  const [banner,               setBanner]               = useState(null);
  const [images,               setImages]               = useState([]);
  const [location,             setLocation]             = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(createPostSchema),
    defaultValues: { title: "", body: "", category: "NOTICES" },
  });

  const titleValue   = watch("title");
  const bodyValue    = watch("body");
  const bodyLength   = bodyValue?.length ?? 0;
  const bodyRemaining = BODY_MAX - bodyLength;
  const canPost      = (titleValue?.trim().length ?? 0) >= 1 || (bodyValue?.trim().length ?? 0) >= 1;

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
      const asset   = result.assets[0];
      const rawName = asset.fileName ?? `banner-${Date.now()}`;
      const name    = /\.[a-z0-9]+$/i.test(rawName) ? rawName : `${rawName}.jpg`;
      setBanner({ uri: asset.uri, name, type: asset.mimeType ?? "image/jpeg" });
    }
  };

  const pickImages = async () => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.85,
    });
    if (!result.canceled && result.assets.length > 0) {
      const picked = result.assets.map((asset) => {
        const rawName = asset.fileName ?? `photo-${Date.now()}`;
        const name    = /\.[a-z0-9]+$/i.test(rawName) ? rawName : `${rawName}.jpg`;
        return { uri: asset.uri, name, type: asset.mimeType ?? "image/jpeg" };
      });
      setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
    }
  };

  const removeImage = (index) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const mutation = useMutation({
    mutationFn: async (values) => {
      const form = new FormData();
      if (values.title?.trim())       form.append("title",       values.title.trim());
      form.append("body",     values.body.trim());
      form.append("category", values.category ?? "NOTICES");
      if (location?.addressText)      form.append("addressText", location.addressText);
      if (location?.latitude  != null) form.append("latitude",   String(location.latitude));
      if (location?.longitude != null) form.append("longitude",  String(location.longitude));
      if (location?.suburb)           form.append("suburb",      location.suburb);
      if (banner) await appendUploadFile(form, "banner", banner);
      for (const img of images) {
        await appendUploadFile(form, "attachments", img);
      }
      return postsApi.createPostWithMedia(form);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigation.goBack();
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : err?.message ?? "Could not create post");
    },
  });

  const isCommittee = user?.role === "COMMITTEE" || user?.role === "ADMIN";
  const isPending   = mutation.isPending;

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

  const cardBg     = semantic.cardBackground;
  const shadowColor = scheme === "dark" ? "#000000" : "#334155";

  // Author identity
  const firstName   = user?.firstName ?? "";
  const lastName    = user?.lastName  ?? "";
  const fullName    = [firstName, lastName].filter(Boolean).join(" ") || "You";
  const avatarBg    = getAvatarColor(String(user?.id ?? fullName));
  const initials    = getInitials(firstName, lastName);

  return (
    <Screen edges={["top", "bottom"]} padded={false}>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: colors.border }]}>
        <Pressable onPress={handleBack} style={styles.headerIconBtn} hitSlop={8}>
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New post</Text>
        <Pressable
          onPress={handleSubmit((v) => mutation.mutate(v))}
          disabled={isPending || !canPost}
          style={[
            styles.postBtn,
            { backgroundColor: canPost && !isPending ? colors.primary : hexAlpha(colors.primary, 0.35) },
          ]}
        >
          <Text style={styles.postBtnText}>{isPending ? "Posting…" : "Post"}</Text>
        </Pressable>
      </View>

      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── Category selector ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>CATEGORY</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { value, onChange } }) => (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipScroll}
              >
                {CATEGORIES.map((opt) => {
                  const active = value === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => onChange(opt.value)}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={`Category: ${opt.label}`}
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          backgroundColor: active ? colors.primary : cardBg,
                          borderColor:     active ? colors.primary : colors.border,
                          opacity:         pressed ? 0.75 : 1,
                        },
                      ]}
                    >
                      <Ionicons
                        name={active ? opt.icon : `${opt.icon}-outline`}
                        size={13}
                        color={active ? "#FFF" : colors.textMuted}
                      />
                      <Text style={[styles.chipText, { color: active ? "#FFF" : colors.text }]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          />
        </View>

        {/* ── Compose card ──────────────────────────────────────────── */}
        {/* Outer layer casts the shadow; inner layer clips content */}
        <View style={[styles.composeShadow, { backgroundColor: cardBg, shadowColor }]}>
          <View style={[styles.composeCard, { backgroundColor: cardBg }]}>

            {/* Banner preview — top of card, clipped by composeCard overflow:hidden */}
            {banner ? (
              <View style={[styles.bannerWrap, { borderBottomColor: colors.border }]}>
                <Image source={{ uri: banner.uri }} style={styles.bannerImage} resizeMode="cover" />
                <Pressable onPress={() => setBanner(null)} style={styles.bannerRemoveBtn} hitSlop={8}>
                  <View style={styles.gridRemoveBg}>
                    <Ionicons name="close" size={12} color="#FFF" />
                  </View>
                </Pressable>
              </View>
            ) : null}

            {/* Author identity row */}
            <View style={[styles.authorRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.authorAvatar, { backgroundColor: avatarBg }]}>
                <Text style={styles.authorInitials}>{initials}</Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={[styles.authorName, { color: colors.text }]}>{fullName}</Text>
                <Text style={[styles.authorSub,  { color: colors.textMuted }]}>
                  Posting to your neighbourhood
                </Text>
              </View>
            </View>

            {/* Title */}
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange, onBlur } }) => (
                <RNTextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Give it a headline…"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.titleInput, { color: colors.text }]}
                  returnKeyType="next"
                />
              )}
            />

            {/* Body */}
            <Controller
              control={control}
              name="body"
              render={({ field: { value, onChange, onBlur } }) => (
                <RNTextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="What do your neighbours need to know?"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.bodyInput, { color: semantic.postBodyText }]}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              )}
            />

            {/* Attachment image grid — sits directly under body, no separator */}
            {images.length > 0 ? (
              <View style={styles.mediaGridWrap}>
                <MediaGrid images={images} onRemove={removeImage} />
              </View>
            ) : null}

            {/* Character counter — only visible once the user starts typing */}
            {bodyLength > 0 ? (
              <View style={styles.charCountRow}>
                <Text
                  style={[
                    styles.charCount,
                    {
                      color:
                        bodyRemaining < 50  ? colors.danger  :
                        bodyRemaining < 200 ? colors.primary :
                        colors.textMuted,
                    },
                  ]}
                >
                  {bodyLength} / {BODY_MAX}
                </Text>
              </View>
            ) : null}

            {/* Toolbar divider */}
            <View style={[styles.hairline, { backgroundColor: colors.border }]} />

            {/* Action toolbar */}
            <View style={styles.toolbar}>
              <Pressable
                onPress={pickBanner}
                style={({ pressed }) => [
                  styles.toolBtn,
                  {
                    backgroundColor: banner ? hexAlpha(colors.primary, 0.1) : "transparent",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Ionicons
                  name={banner ? "image" : "image-outline"}
                  size={18}
                  color={banner ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.toolBtnText, { color: banner ? colors.primary : colors.textMuted }]}>
                  {banner ? "Banner set" : "Banner"}
                </Text>
              </Pressable>

              <Pressable
                onPress={pickImages}
                disabled={images.length >= MAX_IMAGES}
                style={({ pressed }) => [
                  styles.toolBtn,
                  {
                    backgroundColor: images.length ? hexAlpha(colors.primary, 0.1) : "transparent",
                    opacity: pressed || images.length >= MAX_IMAGES ? 0.5 : 1,
                  },
                ]}
              >
                <Ionicons
                  name={images.length ? "images" : "images-outline"}
                  size={18}
                  color={images.length ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.toolBtnText, { color: images.length ? colors.primary : colors.textMuted }]}>
                  {images.length ? `${images.length} / ${MAX_IMAGES} photos` : "Photos"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setLocationModalVisible(true)}
                style={({ pressed }) => [
                  styles.toolBtn,
                  {
                    backgroundColor: location ? hexAlpha(colors.primary, 0.1) : "transparent",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Ionicons
                  name={location ? "location" : "location-outline"}
                  size={18}
                  color={location ? colors.primary : colors.textMuted}
                />
                <Text style={[styles.toolBtnText, { color: location ? colors.primary : colors.textMuted }]}>
                  {location ? "Located" : "Location"}
                </Text>
              </Pressable>
            </View>

            {/* Location attachment pill */}
            {location ? (
              <View style={[styles.attachmentRow, { borderTopColor: colors.border }]}>
                <View
                  style={[
                    styles.attachmentPill,
                    {
                      backgroundColor: hexAlpha(colors.primary, 0.08),
                      borderColor:     hexAlpha(colors.primary, 0.22),
                    },
                  ]}
                >
                  <Ionicons name="location" size={13} color={colors.primary} />
                  <Text
                    style={[styles.attachmentText, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {location.addressText}
                  </Text>
                  <Pressable onPress={() => setLocation(null)} hitSlop={8}>
                    <Ionicons name="close-circle" size={15} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>
            ) : null}

          </View>
        </View>

        {/* ── Pin card (committee / admin only) ─────────────────────── */}
        {isCommittee ? (
          <View style={[styles.pinCard, { backgroundColor: cardBg, borderColor: colors.border }]}>
            {/* Left accent stripe */}
            <View style={[styles.pinStripe, { backgroundColor: colors.primary }]} />
            <View style={[styles.pinIconBg, { backgroundColor: hexAlpha(colors.primary, 0.12) }]}>
              <Ionicons name="pin" size={18} color={colors.primary} />
            </View>
            <View style={styles.pinTextGroup}>
              <Text style={[styles.pinTitle, { color: colors.text }]}>Pin to top</Text>
              <Text style={[styles.pinSub,   { color: colors.textMuted }]}>
                Committee only · Pinned for 24 h
              </Text>
            </View>
            <PinToggle value={pinned} onChange={setPinned} colors={colors} />
          </View>
        ) : null}

        {/* ── Error banner ──────────────────────────────────────────── */}
        {formError ? (
          <View
            style={[
              styles.errorBanner,
              {
                backgroundColor: hexAlpha(colors.danger, 0.08),
                borderColor:     hexAlpha(colors.danger, 0.22),
              },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{formError}</Text>
          </View>
        ) : null}

      </KeyboardAwareScrollView>

      <LocationPickerModal
        visible={locationModalVisible}
        onConfirm={(loc) => {
          setLocation(loc);
          setLocationModalVisible(false);
        }}
        onClose={() => setLocationModalVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // ── Header ──────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerIconBtn: {
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
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },
  postBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  // ── Scroll container ────────────────────────────────────────────────
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl + spacing.lg,
    gap: spacing.md,
  },

  // ── Section wrapper ─────────────────────────────────────────────────
  section: {
    paddingHorizontal: H_PAD,
  },

  // ── Eyebrow label ───────────────────────────────────────────────────
  eyebrow: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  // ── Category chips ──────────────────────────────────────────────────
  chipScroll: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.1,
  },

  // ── Compose card (shadow wrapper pattern §6.3) ───────────────────────
  composeShadow: {
    borderRadius: 22,
    marginHorizontal: H_PAD,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
    }),
  },
  composeCard: {
    borderRadius: 22,
    overflow: "hidden",
  },

  // ── Author row ──────────────────────────────────────────────────────
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: H_PAD,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 0.5,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  authorInitials: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  authorInfo: {
    gap: 2,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  authorSub: {
    fontSize: 12.5,
    fontWeight: "500",
  },

  // ── Title & body inputs ─────────────────────────────────────────────
  titleInput: {
    paddingHorizontal: H_PAD,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  bodyInput: {
    paddingHorizontal: H_PAD,
    paddingTop: 4,
    paddingBottom: spacing.sm,
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: 0.1,
    minHeight: 100,
  },

  // ── Character counter ───────────────────────────────────────────────
  charCountRow: {
    alignItems: "flex-end",
    paddingHorizontal: H_PAD,
    paddingBottom: 8,
  },
  charCount: {
    fontSize: 12,
    fontWeight: "500",
  },

  // ── Toolbar ─────────────────────────────────────────────────────────
  hairline: {
    height: 0.5,
  },
  toolbar: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: 4,
  },
  toolBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  toolBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // ── Location attachment pill ────────────────────────────────────────
  attachmentRow: {
    paddingHorizontal: H_PAD,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 0.5,
  },
  attachmentPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  attachmentText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "500",
  },

  // ── Banner preview — sits at the top of the card, no border needed ──
  bannerWrap: {
    borderBottomWidth: 0.5,
  },
  bannerImage: {
    width: "100%",
    height: 180,
  },
  bannerRemoveBtn: {
    position: "absolute",
    top: 8,
    right: 8,
  },

  // ── Media grid wrapper ───────────────────────────────────────────────
  mediaGridWrap: {
    marginTop: spacing.sm,
  },

  // ── Pin card ─────────────────────────────────────────────────────────
  pinCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: spacing.md,
    overflow: "hidden",
    marginHorizontal: H_PAD,
  },
  pinStripe: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  pinIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  pinTextGroup: {
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
    fontWeight: "500",
  },

  // ── Toggle ───────────────────────────────────────────────────────────
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

  // ── Error banner ─────────────────────────────────────────────────────
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: H_PAD,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
});
