import SendIcon from "@/assets/icons/send.svg";
import { Check, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { Form } from "@/src/widgets/form";
import React from "react";
import type { Control, UseFormReturn } from "react-hook-form";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { semanticColors } from "@/src/shared/constants/colors";
import type { CommentForm } from "../../types";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  statusText: {
    color: semanticColors.brand.accent,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    flex: 1,
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
  contentSection: {
    flex: 1,
  },
  cancelButton: {
    paddingLeft: 12,
    paddingBottom: 1,
  },
  checkboxContainer: {
    paddingLeft: 12,
    height: 25,
  },
  checkboxText: {
    marginRight: 4,
    color: semanticColors.text.primary,
    fontSize: 15,
    height: 25,
    lineHeight: 25,
    alignItems: "center",
  },
  inputStyle: {
    width: "100%",
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 14,
    color: semanticColors.brand.accent,
    borderBottomWidth: 0,
    outlineWidth: 0,
  },
  sendButton: {
    marginRight: 12,
  },
});

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
  return (
    <View style={styles.container}>
      {editingCommentId && (
        <View style={styles.statusContainer}>
          <Text size="sm" style={styles.statusText}>
            댓글 수정 중...
          </Text>
          <TouchableOpacity onPress={handleCancelEdit}>
            <Text size="sm" style={styles.statusText}>
              취소
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {!editingCommentId && replyingToCommentId && (
        <View style={styles.statusContainer}>
          <Text size="sm" style={styles.statusText}>
            답글 작성 중...
          </Text>
          {handleCancelReply && (
            <TouchableOpacity onPress={handleCancelReply}>
              <Text size="sm" style={styles.statusText}>
                취소
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
        <View style={styles.contentSection}>
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
    <Text>취소</Text>
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
      style={styles.checkboxContainer}
      checked={checked}
      size={25}
      onChange={setChecked}
    >
      <Text style={styles.checkboxText}>
        익명
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
    style={styles.inputStyle}
    placeholder="댓글을 입력하세요"
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
