import { semanticColors } from "@/src/shared/constants/colors";
import { useBoolean } from "@/src/shared/hooks/use-boolean";
import { dayUtils } from "@/src/shared/libs";
import type { UniversityName } from "@/src/shared/libs/univ";
import { LinkifiedText, Show, Text } from "@/src/shared/ui";
import React, { useRef, useState } from "react";
import { Platform, View, TouchableOpacity, Image, Modal, Pressable, TouchableWithoutFeedback, StyleSheet } from "react-native";
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignSelf: 'stretch',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.default,
  },
  replyRow: {
    flexDirection: 'row',
  },
  replyIndent: {
    paddingLeft: 16,
  },
  replyIconContainer: {
    marginRight: 8,
    marginTop: 4,
  },
  replyIcon: {
    width: 16,
    height: 16,
  },
  contentContainer: {
    flex: 1,
    minWidth: 0,
  },
  userContainer: {
    position: 'relative',
    paddingHorizontal: 8,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  userInfoLeft: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  actionButtonsContainer: {
    alignSelf: 'flex-start',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  likeCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
    actionButtonsBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: semanticColors.surface.background,
  },
  menuButtonContainer: {
    position: 'relative',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownMenu: {
    position: 'absolute',
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
  },
  dropdownButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownButtonBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  commentContentContainer: {
    alignSelf: 'stretch',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  linkifiedText: {
    fontSize: 14,
    lineHeight: Platform.OS === 'ios' ? 18 : 20,
  },
  actionButtonIcon: {
    width: 12,
    height: 12,
  },
  heartIcon: {
    width: 12,
    height: 10,
    tintColor: '#A892D7',
  },
});

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
        style={[
          styles.container,
          {
            backgroundColor: isEditing ? semanticColors.surface.secondary : semanticColors.surface.background,
          }
        ]}
      >
      {/* 대댓글인 경우 화살표 아이콘과 들여쓰기 */}
      <View style={[styles.replyRow, isReply && styles.replyIndent]}>
        {isReply && (
          <View style={styles.replyIconContainer}>
            <Image
              source={require('@/assets/icons/reply.png')}
              style={styles.replyIcon}
              resizeMode="contain"
            />
          </View>
        )}

        <View style={styles.contentContainer}>
          <View style={styles.userContainer}>
            <View style={styles.userInfoRow}>
              <View style={styles.userInfoLeft}>
                <UserProfile
                  author={comment.author}
                  universityName={
                    comment.author.universityDetails.name as UniversityName
                  }
                  isOwner={isAuthor}
                  hideUniv
                />
              </View>

              {/* 액션 버튼들 */}
              <View style={styles.actionButtonsContainer}>
                <View style={styles.actionButtonsBackground}>
                  {/* 답글 버튼 */}
                  {onReply && (
                    <TouchableOpacity onPress={() => onReply(rootParentId || comment.id)}>
                      <Image
                        source={require("@/assets/icons/engagement.png")}
                        style={styles.actionButtonIcon}
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
                        style={styles.heartIcon}
                      />
                    )}
                  </TouchableOpacity>

                  {/* 더보기 버튼 (작성자에게만) */}
                  <Show when={isAuthor}>
                    <TouchableWithoutFeedback onPress={handleToggleMenu}>
                      <View ref={containerRef} style={styles.menuButtonContainer}>
                        <Image
                          source={require("@/assets/icons/menu-dots-vertical.png")}
                          style={styles.actionButtonIcon}
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  </Show>
                </View>
              </View>
            </View>

            {/* 두 번째 행: 시간 + 좋아요 수 */}
            <View style={styles.metaRow}>
              <Text size={"sm"} textColor="pale-purple">
                {dayUtils.formatRelativeTime(comment.updatedAt)}
              </Text>

              {/* 좋아요 수 표시 - 좋아요가 있을 때만 */}
              {comment.likeCount > 0 && (
                <View style={styles.likeCountContainer}>
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

  
            {/* 드롭다운 메뉴 Modal */}
            <Modal
              visible={isMenuOpen}
              transparent
              animationType="fade"
              onRequestClose={closeMenu}
            >
              <TouchableWithoutFeedback onPress={closeMenu}>
                <View style={styles.modalOverlay}>
                  <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                    <View style={[
                      styles.dropdownMenu,
                      {
                        top: dropdownPosition.top,
                        left: dropdownPosition.right,
                      }
                    ]}>
                      <Pressable
                        onPress={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUpdate();
                        }}
                        style={[
                          styles.dropdownButton,
                          styles.dropdownButtonBorder,
                          { backgroundColor: semanticColors.surface.background }
                        ]}
                      >
                        <Text size="sm" textColor="black">수정</Text>
                      </Pressable>
                      <Pressable
                        onPress={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete();
                        }}
                        style={[
                          styles.dropdownButton,
                          { backgroundColor: semanticColors.surface.background }
                        ]}
                      >
                        <Text size="sm" textColor="black">삭제</Text>
                      </Pressable>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>

            <View style={styles.commentContentContainer}>
              <LinkifiedText
                textColor="black"
                style={styles.linkifiedText}
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
