import SendIcon from "@/assets/icons/send.svg";
import { cn } from "@/src/shared/libs";
import { Check, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { Form } from "@/src/widgets/form";
import React from "react";
import type { Control, UseFormReturn } from "react-hook-form";
import { TouchableOpacity, View } from "react-native";
import type { CommentForm } from "../../types";

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
    <View>
      {editingCommentId && (
        <View className="flex-row items-center justify-between bg-surface-background px-3 py-2 mb-2 rounded-lg">
          <Text size="sm" className="text-brand-accent">
            댓글 수정 중...
          </Text>
          <TouchableOpacity onPress={handleCancelEdit}>
            <Text size="sm" className="text-brand-accent">
              취소
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {!editingCommentId && replyingToCommentId && (
        <View className="flex-row items-center justify-between bg-surface-background px-3 py-2 mb-2 rounded-lg">
          <Text size="sm" className="text-brand-accent">
            답글 작성 중...
          </Text>
          {handleCancelReply && (
            <TouchableOpacity onPress={handleCancelReply}>
              <Text size="sm" className="text-brand-accent">
                취소
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View
        className={cn([
          "flex-row flex items-center gap-[5px]",
          "rounded-[16px] bg-surface-background h-[50px] w-full",
        ])}
      >
        <View className="flex-row items-center gap-[5px]">
          {editingCommentId && <CancelEditButton onCancel={handleCancelEdit} />}
          {!editingCommentId && (
            <AnonymousToggle checked={checked} setChecked={setChecked} />
          )}
        </View>
        <View className="flex-1">
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
  <TouchableOpacity className="pl-[12px] pb-[1px]" onPress={onCancel}>
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
      className="pl-[12px] h-[25px] "
      checked={checked}
      size={25}
      onChange={setChecked}
    >
      <Text className="mr-1 text-text-primary text-[15px] h-[25px] leading-[25px] flex items-center">
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
    className={cn([
      "w-full flex-1 px-2",
      "text-sm md:text-md",
      "text-brand-accent border-b-0 outline-none",
    ])}
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
  <TouchableOpacity onPress={onPress} disabled={disabled} className="mr-[12px]">
    <IconWrapper size={22}>
      <SendIcon />
    </IconWrapper>
  </TouchableOpacity>
);
