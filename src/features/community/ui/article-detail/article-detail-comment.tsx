import colors from "@/src/shared/constants/colors";
import { useBoolean } from "@/src/shared/hooks/use-boolean";
import { dayUtils } from "@/src/shared/libs";
import type { UniversityName } from "@/src/shared/libs/univ";
import { Divider, Show, Text } from "@/src/shared/ui";
import { Dropdown, type DropdownItem } from "@/src/shared/ui/dropdown";
import type React from "react";
import { useMemo } from "react";
import { Platform, View } from "react-native";
import { useAuth } from "../../../auth";
import type { Comment } from "../../types";
import { UserProfile } from "../user-profile";

interface ArticleDetailCommentProps {
  comment: Comment;
  isEditing?: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string) => void;
}

export const ArticleDetailComment: React.FC<ArticleDetailCommentProps> = ({
  comment,
  onDelete,
  onUpdate,
  isEditing = false,
}) => {
  const { my } = useAuth();
  const isAuthor = comment.author.id === my?.id;
  const { value: isDropdownOpen, toggle: toggleDropdown } = useBoolean();

  const dropdownItems: DropdownItem[] = useMemo(
    () => [
      {
        key: "update",
        content: <Text textColor="black">수정</Text>,
        onPress: () => onUpdate(comment.id),
      },
      {
        key: "delete",
        content: <Text textColor="black">삭제</Text>,
        onPress: () => onDelete(comment.id),
      },
    ],
    [comment.id, onUpdate, onDelete]
  );

  return (
    <View
      key={comment.id}
      style={{
        backgroundColor: isEditing ? colors.moreLightPurple : colors.white,
      }}
      className="flex py-4 flex-col w-full border-b border-[#E7E9EC]"
    >
      <View className="relative px-2">
        <UserProfile
          author={comment.author}
          universityName={
            comment.author.universityDetails.name as UniversityName
          }
          isOwner={isAuthor}
          updatedAt={
            <Text className="text-sm" textColor="pale-purple">
              {dayUtils.formatRelativeTime(comment.updatedAt)}
            </Text>
          }
          hideUniv
        />

        <View className=" absolute right-0 top-0  ">
          <Show when={isAuthor}>
            <Dropdown open={isDropdownOpen} items={dropdownItems} />
          </Show>
        </View>
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: "row",
          paddingLeft: 48,
          paddingRight: 16,
        }}
      >
        <Text
          className="text-sm flex-1"
          textColor="black"
          style={{
            flexWrap: "wrap",
            flexShrink: 1,
            lineHeight: Platform.OS === "ios" ? 18 : 20,
          }}
        >
          {comment.content}
        </Text>
      </View>
    </View>
  );
};
