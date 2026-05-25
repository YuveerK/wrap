import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as postsApi from "@/api/posts";
import { ApiError } from "@/api/client";
import { Button } from "@/components/Button/Button";
import { KeyboardAwareScrollView } from "@/components/KeyboardAwareScrollView/KeyboardAwareScrollView";
import { QuotedComment } from "@/components/QuotedComment/QuotedComment";
import { Screen } from "@/components/Screen/Screen";
import { TextInput } from "@/components/TextInput/TextInput";
import { useTheme } from "@/theme";
import { scrollContentBelowHeader } from "@/theme/screenLayout";
import { spacing } from "@/theme/spacing";
import { styles } from "./PostCommentScreen.styles";

export function PostCommentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  /** @type {{ postId: number, parentId?: number, quoteAuthorName?: string, quoteBody?: string }} */
  const { postId, parentId, quoteAuthorName, quoteBody } = route.params;
  const id = Number(postId);
  const isReply = Boolean(parentId && quoteBody);
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    navigation.setOptions({ title: isReply ? "Reply" : "Comment" });
  }, [navigation, isReply]);

  const mutation = useMutation({
    mutationFn: () =>
      postsApi.createComment(id, {
        body: body.trim(),
        ...(parentId ? { parentId: Number(parentId) } : {}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["post", id] });
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigation.goBack();
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not post comment",
      );
    },
  });

  const canSubmit = body.trim().length > 0 && !mutation.isPending;

  return (
    <Screen edges={["bottom"]} padded={false}>
      <KeyboardAwareScrollView contentContainerStyle={scrollContentBelowHeader}>
        {isReply ? (
          <QuotedComment
            authorName={quoteAuthorName ?? "Neighbor"}
            body={quoteBody}
          />
        ) : (
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Share your thoughts with the community.
          </Text>
        )}

        <View style={styles.inputBlock}>
          <TextInput
            label={isReply ? "Your reply" : "Your comment"}
            value={body}
            onChangeText={setBody}
            inputProps={{
              multiline: true,
              numberOfLines: 6,
              textAlignVertical: "top",
              autoFocus: true,
              placeholder: isReply ? "Write a reply…" : "Write a comment…",
            }}
          />
        </View>

        {error ? (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        ) : null}

        <Button
          title={mutation.isPending ? "Posting…" : isReply ? "Post reply" : "Post comment"}
          onPress={() => {
            setError("");
            mutation.mutate();
          }}
          disabled={!canSubmit}
        />
      </KeyboardAwareScrollView>
    </Screen>
  );
}
