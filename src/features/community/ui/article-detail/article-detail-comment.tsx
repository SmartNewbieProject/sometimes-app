import colors , { semanticColors } from "@/src/shared/constants/colors";
import { useBoolean } from "@/src/shared/hooks/use-boolean";
import { dayUtils } from "@/src/shared/libs";
import type { UniversityName } from "@/src/shared/libs/univ";
import { LinkifiedText, Show, Text } from "@/src/shared/ui";
import React, { useRef, useState } from "react";
import { Platform, View, TouchableOpacity, Image, Modal, Pressable, TouchableWithoutFeedback } from "react-native";
import { useAuth } from "../../../auth";
import type { Comment } from "../../types";
import { UserProfile } from "../user-profile";
import AreaFillHeart from "@/assets/icons/area-fill-heart.svg";

interface ArticleDetailCommentProps {
  comment: Comment;
  isEditing?: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string) => void;
  onReply?: (parentId: string) => void;
  onLike: (commentId: string) => void;
  isReply?: boolean;
  rootParentId?: string;
}

export const ArticleDetailComment: React.FC<ArticleDetailCommentProps> = ({
  comment,
  onDelete,
  onUpdate,
  onReply,
  onLike,
  isEditing = false,
  isReply = false,
  rootParentId,
}) => {
  const { my } = useAuth();
  const isAuthor = comment.author.id === my?.id;
  const { value: isMenuOpen, setFalse: closeMenu, setTrue: openMenu } = useBoolean();
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const containerRef = useRef<View>(null);

  const handleToggleMenu = () => {
    if (!isMenuOpen && containerRef.current) {
      containerRef.current.measure((_fx, _fy, width, height, px, py) => {
        setDropdownPosition({
          top: py + height + 4,
          right: px + width - 80,
        });
      });
      openMenu();
    } else {
      closeMenu();
    }
  };

  const handleUpdate = () => {
    onUpdate(comment.id);
    closeMenu();
  };

  const handleDelete = () => {
    onDelete(comment.id);
    closeMenu();
  };

  return (
    <View
        key={comment.id}
        style={{
          backgroundColor: isEditing ? colors.moreLightPurple : colors.white,
        }}
        className="flex py-3 flex-col w-full border-b border-border-default"
      >
      {/* 대댓글인 경우 화살표 아이콘과 들여쓰기 */}
      <View className={`flex-row ${isReply ? 'pl-4' : ''}`}>
        {isReply && (
          <View className="mr-2 mt-1">
            <Image
              source={require('@/assets/icons/reply.png')}
              style={{ width: 16, height: 16 }}
              resizeMode="contain"
            />
          </View>
        )}

        <View className="flex-1">
          <View className="relative px-2">
            <UserProfile
              author={comment.author}
              universityName={
                comment.author.universityDetails.name as UniversityName
              }
              isOwner={isAuthor}
              updatedAt={
                <View className="flex-row items-center gap-x-2">
                  <Text size={"sm"} textColor="pale-purple">
                    {dayUtils.formatRelativeTime(comment.updatedAt)}
                  </Text>

                  {/* 좋아요 수 표시 - 좋아요가 있을 때만 */}
                  {comment.likeCount > 0 && (
                    <View className="flex-row items-center gap-x-1">
                      <AreaFillHeart
                        width={14}
                        height={14}
                      />
                      <Text size={"sm"} textColor="pale-purple">
                        {comment.likeCount}
                      </Text>
                    </View>
                  )}
                </View>
              }
              hideUniv
            />

            {/* 액션 버튼들 */}
            <View className="absolute right-0 top-0">
              <View
                className="flex-row items-center gap-x-3 px-2 py-1 rounded-lg"
                style={{ backgroundColor: semanticColors.surface.background }}
              >
                {/* 답글 버튼 */}
                {onReply && (
                  <TouchableOpacity onPress={() => onReply(rootParentId || comment.id)}>
                    <Image
                      source={require("@/assets/icons/engagement.png")}
                      style={{ width: 12, height: 12 }}
                    />
                  </TouchableOpacity>
                )}

                {/* 좋아요 버튼 */}
                <TouchableOpacity onPress={() => onLike(comment.id)}>
                  {comment.isLiked ? (
                    <AreaFillHeart
                      width={14}
                      height={14}
                    />
                  ) : (
                    <Image
                      source={require("@/assets/icons/heart.png")}
                      style={{
                        width: 12,
                        height: 10,
                        tintColor: "#A892D7"
                      }}
                    />
                  )}
                </TouchableOpacity>

                {/* 더보기 버튼 (작성자에게만) */}
                <Show when={isAuthor}>
                  <TouchableWithoutFeedback onPress={handleToggleMenu}>
                    <View ref={containerRef} style={{ position: 'relative' }}>
                      <Image
                        source={require("@/assets/icons/menu-dots-vertical.png")}
                        style={{ width: 12, height: 12 }}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </Show>
              </View>
            </View>

            {/* 드롭다운 메뉴 Modal */}
            <Modal
              visible={isMenuOpen}
              transparent
              animationType="fade"
              onRequestClose={closeMenu}
            >
              <TouchableWithoutFeedback onPress={closeMenu}>
                <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                  <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                    <View style={{
                      position: 'absolute',
                      top: dropdownPosition.top,
                      left: dropdownPosition.right,
                      width: 80,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: semanticColors.surface.background,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 8,
                      borderWidth: 1,
                      borderColor: semanticColors.border.default,
                    }}>
                      <Pressable
                        onPress={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUpdate();
                        }}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: '#f5f5f5',
                          backgroundColor: semanticColors.surface.background,
                        }}
                      >
                        <Text size="sm" textColor="black">수정</Text>
                      </Pressable>
                      <Pressable
                        onPress={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete();
                        }}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          backgroundColor: semanticColors.surface.background,
                        }}
                      >
                        <Text size="sm" textColor="black">삭제</Text>
                      </Pressable>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                paddingLeft: 48,
                paddingRight: 16,
              }}
            >
              <LinkifiedText
                className="text-[14px] flex-1"
                textColor="black"
                style={{
                  flexWrap: "wrap",
                  flexShrink: 1,
                  lineHeight: Platform.OS === "ios" ? 18 : 20,
                }}
              >
                {comment.content}
              </LinkifiedText>
            </View>


          </View>
        </View>
      </View>
    </View>
  );
};
