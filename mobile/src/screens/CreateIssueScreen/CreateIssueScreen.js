import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "@/components/KeyboardAwareScrollView/KeyboardAwareScrollView";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import * as issuesApi from "@/api/issues";
import { ApiError } from "@/api/client";
import { Screen } from "@/components/Screen/Screen";
import { hexAlpha } from "@/lib/issues";
import { createIssueSchema } from "@/lib/validation/issueSchemas";
import { SCREENS } from "@/navigation/params";
import { useTheme } from "@/theme";
import { spacing } from "@/theme/spacing";
import { scrollContentBelowHeader } from "@/theme/screenLayout";

const H_PAD = spacing.md + 4;

const KIND_OPTIONS = [
  { label: "Roads", value: "ROADS", icon: "construct-outline" },
  { label: "Water", value: "WATER", icon: "water-outline" },
  { label: "Electrical", value: "ELECTRICITY", icon: "flash-outline" },
  { label: "Waste", value: "WASTE", icon: "trash-outline" },
  { label: "Safety", value: "OTHER", icon: "shield-half-outline" },
  { label: "Other", value: "POTHOLE", icon: "alert-circle-outline" },
];

export function CreateIssueScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { colors, semantic } = useTheme();
  const [formError, setFormError] = useState("");
  const [photo, setPhoto] = useState(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createIssueSchema),
    defaultValues: {
      category: "ROADS",
      title: "",
      description: "",
      addressText: "",
    },
  });

  const titleValue = watch("title");
  const descValue = watch("description");

  const mutation = useMutation({
    mutationFn: (values) =>
      issuesApi.createIssue({
        category: values.category,
        title: values.title.trim(),
        description: values.description.trim(),
        addressText: values.addressText?.trim() || undefined,
      }),
    onSuccess: async (res) => {
      await queryClient.invalidateQueries({ queryKey: ["issues"] });
      navigation.replace(SCREENS.IssueDetail, { issueId: res.issue.id });
    },
    onError: (err) => {
      setFormError(
        err instanceof ApiError ? err.message : "Could not report issue",
      );
    },
  });

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const cardBg = semantic.cardBackground;
  const inputBorder = semantic.inputBorder;
  const inputBg = semantic.inputBg;

  return (
    <Screen edges={[]} padded={false}>
      <KeyboardAwareScrollView
        contentContainerStyle={[scrollContentBelowHeader, styles.scrollContent]}
      >
        {/* Kind picker */}
        <View>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            WHAT KIND OF ISSUE?
          </Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { value, onChange } }) => (
              <View style={styles.kindGrid}>
                {KIND_OPTIONS.map((opt) => {
                  const active = value === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => onChange(opt.value)}
                      style={[
                        styles.kindItem,
                        {
                          backgroundColor: active
                            ? hexAlpha(colors.primary, 0.10)
                            : cardBg,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={opt.icon}
                        size={22}
                        color={active ? colors.primary : colors.text}
                      />
                      <Text
                        style={[
                          styles.kindLabel,
                          { color: active ? colors.primary : colors.text },
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

        {/* Title field */}
        <View>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            TITLE
          </Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange, onBlur } }) => (
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: inputBg, borderColor: inputBorder },
                ]}
              >
                <RNTextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="What's wrong?"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.titleInput, { color: colors.text }]}
                  returnKeyType="next"
                />
              </View>
            )}
          />
          {errors.title ? (
            <Text style={[styles.fieldError, { color: colors.danger }]}>
              {errors.title.message}
            </Text>
          ) : null}
        </View>

        {/* Details field */}
        <View>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            DETAILS
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange, onBlur } }) => (
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: inputBg, borderColor: inputBorder },
                ]}
              >
                <RNTextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Anything the contractor should know?"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.detailsInput, { color: colors.text }]}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}
          />
          {errors.description ? (
            <Text style={[styles.fieldError, { color: colors.danger }]}>
              {errors.description.message}
            </Text>
          ) : null}
        </View>

        {/* Location row */}
        <View>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            LOCATION
          </Text>
          <Controller
            control={control}
            name="addressText"
            render={({ field: { value, onChange, onBlur } }) => (
              <View
                style={[
                  styles.locationContainer,
                  { backgroundColor: inputBg, borderColor: inputBorder },
                ]}
              >
                <Ionicons name="location-outline" size={18} color={colors.primary} />
                <RNTextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter location"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.locationInput, { color: colors.text }]}
                />
                <Pressable
                  style={[
                    styles.useMapBtn,
                    { backgroundColor: hexAlpha(colors.primary, 0.12) },
                  ]}
                >
                  <Text style={[styles.useMapLabel, { color: colors.primary }]}>
                    Use map
                  </Text>
                </Pressable>
              </View>
            )}
          />
        </View>

        {/* Photo dropzone */}
        <View>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            PHOTO (OPTIONAL)
          </Text>
          {photo ? (
            <View style={styles.photoPreviewWrap}>
              <Image source={{ uri: photo }} style={styles.photoPreview} />
              <View style={styles.photoActions}>
                <Pressable onPress={pickPhoto}>
                  <Text style={[styles.photoAction, { color: colors.primary }]}>
                    Replace
                  </Text>
                </Pressable>
                <Pressable onPress={() => setPhoto(null)}>
                  <Text style={[styles.photoAction, { color: colors.danger }]}>
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={pickPhoto}
              style={[
                styles.dropzone,
                { backgroundColor: cardBg, borderColor: colors.border },
              ]}
            >
              <Ionicons name="camera-outline" size={26} color={colors.textMuted} />
              <Text style={[styles.dropzoneLabel, { color: colors.textMuted }]}>
                Add a photo to help fix it faster
              </Text>
            </Pressable>
          )}
        </View>

        {formError ? (
          <Text style={[styles.formError, { color: colors.danger }]}>
            {formError}
          </Text>
        ) : null}

        {/* Submit pill */}
        <Pressable
          onPress={handleSubmit((values) => mutation.mutate(values))}
          disabled={mutation.isPending}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: colors.primary,
              opacity: mutation.isPending ? 0.7 : pressed ? 0.9 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Submit report"
        >
          <Ionicons name="send" size={18} color="#FFF" />
          <Text style={styles.submitLabel}>
            {mutation.isPending ? "Submitting…" : "Submit report"}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  kindGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 10,
  },
  kindItem: {
    width: "31%",
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  kindLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  detailsInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 96,
  },
  locationContainer: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  locationInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  useMapBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  useMapLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  dropzone: {
    height: 120,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dropzoneLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  photoPreviewWrap: {
    borderRadius: 14,
    overflow: "hidden",
  },
  photoPreview: {
    width: "100%",
    height: 180,
    borderRadius: 14,
  },
  photoActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  photoAction: {
    fontSize: 14,
    fontWeight: "600",
  },
  fieldError: {
    fontSize: 13,
    marginTop: 4,
  },
  formError: {
    fontSize: 14,
    fontWeight: "500",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: spacing.md,
    borderRadius: 999,
  },
  submitLabel: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
