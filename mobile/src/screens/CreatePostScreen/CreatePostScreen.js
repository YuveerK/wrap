import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import * as postsApi from "@/api/posts";
import { ApiError } from "@/api/client";
import { Button } from "@/components/Button/Button";
import { FormField } from "@/components/FormField/FormField";
import { KeyboardAwareScrollView } from "@/components/KeyboardAwareScrollView/KeyboardAwareScrollView";
import { Screen } from "@/components/Screen/Screen";
import { appendUploadFile } from "@/lib/normalizeUploadFile";
import { createPostSchema } from "@/lib/validation/postSchemas";
import { useTheme } from "@/theme";
import { scrollContentBelowHeader } from "@/theme/screenLayout";
import { spacing } from "@/theme/spacing";
import { styles } from "./CreatePostScreen.styles";

const MAX_ATTACHMENTS = 5;

/**
 * @typedef {{ uri: string, name: string, type: string, isPdf?: boolean }} LocalFile
 */

export function CreatePostScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const [formError, setFormError] = useState("");
  /** @type {[LocalFile | null, Function]} */
  const [banner, setBanner] = useState(null);
  /** @type {[LocalFile[], Function]} */
  const [attachments, setAttachments] = useState([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPostSchema),
    defaultValues: { title: "", body: "" },
  });

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
      setBanner({
        uri: asset.uri,
        name,
        type: asset.mimeType ?? "image/jpeg",
      });
    }
  };

  const pickAttachment = async () => {
    if (attachments.length >= MAX_ATTACHMENTS) return;

    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const isPdf = asset.mimeType === "application/pdf";
      setAttachments((prev) => [
        ...prev,
        {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType ?? "application/octet-stream",
          isPdf,
        },
      ]);
    }
  };

  const buildFormData = async (values) => {
    const form = new FormData();
    if (values.title?.trim()) form.append("title", values.title.trim());
    form.append("body", values.body.trim());

    if (banner) {
      await appendUploadFile(form, "banner", banner);
    }

    for (const file of attachments) {
      await appendUploadFile(form, "attachments", file);
    }

    return form;
  };

  const mutation = useMutation({
    mutationFn: async (values) => {
      const form = await buildFormData(values);
      return postsApi.createPostWithMedia(form);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigation.goBack();
    },
    onError: (err) => {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not create post";
      setFormError(message);
    },
  });

  return (
    <Screen edges={["bottom"]} padded={false}>
      <KeyboardAwareScrollView contentContainerStyle={scrollContentBelowHeader}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Banner image
          </Text>
          <Pressable
            onPress={pickBanner}
            style={[
              styles.bannerPicker,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {banner ? (
              <>
                <Image source={{ uri: banner.uri }} style={styles.bannerPreview} />
                <Pressable
                  style={[styles.removeBanner, { backgroundColor: colors.background }]}
                  onPress={() => setBanner(null)}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={28} color={colors.danger} />
                </Pressable>
              </>
            ) : (
              <View style={styles.bannerPlaceholder}>
                <Ionicons name="image-outline" size={32} color={colors.textMuted} />
                <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
                  Tap to add a banner (optional)
                </Text>
              </View>
            )}
          </Pressable>

          <View style={styles.attachHeader}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Files
            </Text>
            <Pressable
              onPress={pickAttachment}
              disabled={attachments.length >= MAX_ATTACHMENTS}
            >
              <Text
                style={{
                  color:
                    attachments.length >= MAX_ATTACHMENTS
                      ? colors.textMuted
                      : colors.primary,
                  fontWeight: "600",
                }}
              >
                Add file
              </Text>
            </Pressable>
          </View>

          {attachments.map((file, index) => (
            <View
              key={`${file.uri}-${index}`}
              style={[
                styles.attachRow,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {file.isPdf ? (
                <Ionicons
                  name="document-text-outline"
                  size={28}
                  color={colors.primary}
                />
              ) : (
                <Image source={{ uri: file.uri }} style={styles.attachThumb} />
              )}
              <Text
                style={[styles.attachName, { color: colors.text }]}
                numberOfLines={1}
              >
                {file.name}
              </Text>
              <Pressable onPress={() => setAttachments((a) => a.filter((_, i) => i !== index))}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>
          ))}

          <FormField
            control={control}
            name="title"
            label="Title (optional)"
            errors={errors}
          />
          <FormField
            control={control}
            name="body"
            label="Message"
            errors={errors}
            inputProps={{ multiline: true, numberOfLines: 5 }}
          />
          {formError ? (
            <Text style={[styles.error, { color: colors.danger }]}>{formError}</Text>
          ) : null}
          <Button
            title={mutation.isPending ? "Posting…" : "Post to feed"}
            onPress={handleSubmit((values) => mutation.mutate(values))}
            disabled={mutation.isPending}
          />
      </KeyboardAwareScrollView>
    </Screen>
  );
}
