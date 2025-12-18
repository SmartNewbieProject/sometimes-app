import SendIcon from "@/assets/icons/send.svg";
import { Check, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { Form } from "@/src/widgets/form";
import React from "react";
import type { Control, UseFormReturn } from "react-hook-form";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import type { CommentForm } from "../../types";
import { useTranslation } from "react-i18next";
import i18n from "@/src/shared/libs/i18n";
import { semanticColors } from "@/src/shared/constants/semantic-colors";

interface InputFormProps {
  checked: boolean;
  setChecked: (checked: boolean) => void;
  editingCommentId: string | null;
  handleCancelEdit: () => void;
  editingContent: string;
  setEditingContent: (content: string) => void;
  form: UseFormReturn<CommentForm>;
  handleSubmitUpdate: () => void;
  handleSubmit: (data: { content: string }) => void;
  replyingToCommentId?: string | null;
  handleCancelReply?: () => void;
}

export const InputForm = ({
  checked,
  setChecked,
  editingCommentId,
  handleCancelEdit,
  editingContent,
  setEditingContent,
  form,
  handleSubmitUpdate,
  handleSubmit,
  replyingToCommentId,
  handleCancelReply,
}: InputFormProps) => {
  const { t } = useTranslation();
  return (
    <View>
      {editingCommentId && (
        <View style={styles.editingBanner}>
          <Text size="sm" textColor="accent">
            {t("features.community.ui.comment.input_form.editing_comment")}
          </Text>
          <TouchableOpacity onPress={handleCancelEdit}>
            <Text size="sm" textColor="accent">
              {t("global.cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {!editingCommentId && replyingToCommentId && (
        <View style={styles.editingBanner}>
          <Text size="sm" textColor="accent">
            {t("features.community.ui.comment.input_form.replying_comment")}
          </Text>
          {handleCancelReply && (
            <TouchableOpacity onPress={handleCancelReply}>
              <Text size="sm" textColor="accent">
                {t("global.cancel")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.leftSection}>
          {editingCommentId && <CancelEditButton onCancel={handleCancelEdit} />}
          {!editingCommentId && (
            <AnonymousToggle checked={checked} setChecked={setChecked} />
          )}
        </View>
        <View style={styles.inputWrapper}>
          <CommentInput
            control={form.control}
            editingCommentId={editingCommentId}
            editingContent={editingContent}
            setEditingContent={setEditingContent}
          />
        </View>

        <SendButton
          onPress={
            editingCommentId
              ? handleSubmitUpdate
              : form.handleSubmit(handleSubmit)
          }
          disabled={!editingContent.trim()}
        />
      </View>
    </View>
  );
};

const CancelEditButton = ({ onCancel }: { onCancel: () => void }) => (
  <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
    <Text>{i18n.t("features.community.ui.comment.input_form.cancel")}</Text>
  </TouchableOpacity>
);

const AnonymousToggle = ({
  checked,
  setChecked,
}: {
  checked: boolean;
  setChecked: (checked: boolean) => void;
}) => (
  <>
    <Check.Box
      style={styles.checkBox}
      checked={checked}
      size={25}
      onChange={setChecked}
    >
      <Text style={styles.anonymousText}>
        {i18n.t("features.community.ui.comment.input_form.anonymous")}
      </Text>
    </Check.Box>
  </>
);

const CommentInput = ({
  control,
  editingCommentId,
  editingContent,
  setEditingContent,
}: {
  control: Control<CommentForm>;
  editingCommentId: string | null;
  editingContent: string;
  setEditingContent: (content: string) => void;
}) => (
  <Form.Input
    name="content"
    control={control}
    style={styles.commentInput}
    placeholder={i18n.t("features.community.ui.comment.input_form.comment_placeholder")}
    onChange={(e) => setEditingContent(e.nativeEvent.text)}
    returnKeyType="send"
    multiline={false}
  />
);

const SendButton = ({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled: boolean;
}) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} style={styles.sendButton}>
    <IconWrapper size={22}>
      <SendIcon />
    </IconWrapper>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  editingBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 16,
    backgroundColor: semanticColors.surface.background,
    height: 50,
    width: "100%",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  inputWrapper: {
    flex: 1,
  },
  cancelButton: {
    paddingLeft: 12,
    paddingBottom: 1,
  },
  checkBox: {
    paddingLeft: 12,
    height: 25,
  },
  anonymousText: {
    marginRight: 4,
    color: semanticColors.text.primary,
    fontSize: 15,
    height: 25,
    lineHeight: 25,
  },
  commentInput: {
    width: "100%",
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 14,
    color: semanticColors.brand.accent,
    borderBottomWidth: 0,
  },
  sendButton: {
    marginRight: 12,
  },
});
