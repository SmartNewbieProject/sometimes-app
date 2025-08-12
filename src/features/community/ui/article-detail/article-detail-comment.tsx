import colors from "@/src/shared/constants/colors";
import { useBoolean } from "@/src/shared/hooks/use-boolean";
import { dayUtils } from "@/src/shared/libs";
import type { UniversityName } from "@/src/shared/libs/univ";
import { LinkifiedText, Show, Text } from "@/src/shared/ui";
import type React from "react";
import { Platform, View, TouchableOpacity, Image, Modal, Pressable } from "react-native";
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
}

export const ArticleDetailComment: React.FC<ArticleDetailCommentProps> = ({
  comment,
  onDelete,
  onUpdate,
  onReply,
  onLike,
  isEditing = false,
  isReply = false,
}) => {
  const { my } = useAuth();
  const isAuthor = comment.author.id === my?.id;
  const { value: isMenuOpen, toggle: toggleMenu, setFalse: closeMenu } = useBoolean();

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
      className="flex py-3 flex-col w-full border-b border-[#E7E9EC]"
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
                        width={12}
                        height={12}
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
                style={{ backgroundColor: '#F3EDFF' }}
              >
                {/* 답글 버튼 (최상위 댓글에만) */}
                {!isReply && onReply && (
                  <TouchableOpacity onPress={() => onReply(comment.id)}>
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
                      width={12}
                      height={10}
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
                  <TouchableOpacity onPress={toggleMenu}>
                    <Image
                      source={require("@/assets/icons/menu-dots-vertical.png")}
                      style={{ width: 12, height: 12 }}
                    />
                  </TouchableOpacity>
                </Show>
              </View>
            </View>

            {/* 커스텀 메뉴 Modal */}
            <Modal
              visible={isMenuOpen}
              transparent
              animationType="fade"
              onRequestClose={closeMenu}
            >
              <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={closeMenu}>
                <View style={{
                  position: 'absolute',
                  top: 100,
                  right: 20,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                  minWidth: 120
                }}>
                  <TouchableOpacity
                    onPress={handleUpdate}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f0f0f0'
                    }}
                  >
                    <Text size="sm" textColor="black">수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDelete}
                    style={{ paddingHorizontal: 16, paddingVertical: 12 }}
                  >
                    <Text size="sm" textColor="black">삭제</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Modal>
          </View>

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

          {/* 답글 버튼 (최상위 댓글에만 표시) */}
          {!isReply && onReply && (
            <View className="pl-12 pt-2">
              <TouchableOpacity
                onPress={() => onReply(comment.id)}
                className="flex-row items-center"
              >
                <Text size="sm" className="text-[#A892D7]">
                  답글
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
