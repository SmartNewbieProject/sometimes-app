import { useAuth } from "@/src/features/auth";
import { semanticColors } from '@/src/shared/constants/colors';
import { useBoolean } from "@/src/shared/hooks/use-boolean";
import {
  ImageResources,
  type UniversityName,
  dayUtils,
} from "@/src/shared/libs";
import {
  Divider,
  Dropdown,
  type DropdownItem,
  ImageResource,
  LinkifiedText,
  Show,
  Text,
} from "@/src/shared/ui";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { Image, ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";

import type { Article as ArticleType } from "../../types";
import { Comment } from "../comment";
import { UserProfile } from "../user-profile";
import Interaction from "./interaction-nav";
import { useBlockUser } from "../../hooks/use-block-user";
import { useModal } from "@/src/shared/hooks/use-modal";

interface ArticleItemProps {
  data: ArticleType;
  onPress: () => void;
  onLike: () => void;
  refresh: () => void;
  onDelete: (id: string) => void;
  isPreviewOpen: boolean;
  onTogglePreview: () => void;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  articleTouchable: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    marginHorizontal: 8,
    marginTop: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  contentText: {
    marginTop: 8,
    lineHeight: 20,
  },
  imageContainer: {
    width: 70,
    height: 70,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: semanticColors.surface.background,
    width: 70,
    height: 70,
  },
  articleImage: {
    width: '100%',
    height: '100%',
  },
  imageCountBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: semanticColors.text.inverse,
  },
  metaContainer: {
    marginHorizontal: 8,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: semanticColors.text.muted,
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontStyle: 'normal',
    fontWeight: '300',
    lineHeight: 14.4,
    fontFeatureSettings: "'liga' off, 'clig' off",
  },
  metaTextWithMargin: {
    marginLeft: 8,
  },
  interactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionSpacer: {
    width: 12,
  },
  previewContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 6,
    marginTop: 24,
    paddingHorizontal: 18,
  },
  commentContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  commentMargin: {
    marginBottom: 6,
  },
  viewMoreContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 4,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdownContainer: {
    position: 'absolute',
    right: 8,
    top: 12,
  },
  divider: {
    height: 1,
    backgroundColor: semanticColors.surface.other,
  },
});

export function Article({
  data,
  onPress,
  onLike,
  onDelete,
  isPreviewOpen,
  onTogglePreview,
}: ArticleItemProps) {
  const { my } = useAuth();
  const author = data?.author;
  const comments = data.comments;
  const university = author?.universityDetails;
  const universityName = university?.name as UniversityName;
  //   const {
  //     value: showComment,
  //     toggle: toggleShowComment,
  //     setFalse,
  //   } = useBoolean();
  const { value: isDropdownOpen, setValue: setDropdownOpen } = useBoolean();
  const { mutate: blockUser } = useBlockUser();
  const { showModal } = useModal();

  const isOwner = (() => {
    if (!my) return false;
    return my.id === author.id;
  })();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const handleLike = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onLike();
    },
    [onLike]
  );

  const handleBlockUser = () => {
    showModal({
      title: "사용자 차단",
      children: (
        <View>
          <Text size="sm" textColor="black">
            {`'${author.name}'님을 차단하시겠습니까?\n차단하면 해당 사용자의 모든 게시글이 보이지 않게 됩니다.`}
          </Text>
        </View>
      ),
      primaryButton: {
        text: "차단하기",
        onClick: () => {
          blockUser(author.id);
          setDropdownOpen(false);
        },
      },
      secondaryButton: {
        text: "취소",
        onClick: () => {
          setDropdownOpen(false);
        },
      },
    });
  };

  const dropdownMenus: DropdownItem[] = (() => {
    const menus: DropdownItem[] = [];
    if (isOwner) {
      const ownerMenus: DropdownItem[] = [
        {
          key: "update",
          content: "수정",
          onPress: () => {
            router.push(`/community/update/${data.id}`);
          },
        },
        {
          key: "delete",
          content: "삭제",
          onPress: () => {
            onDelete(data.id);
            setDropdownOpen(false);
          },
        },
      ];
      menus.push(...ownerMenus);
    }

    if (!isOwner) {
      menus.push({
        key: "report",
        content: "신고",
        onPress: () => {
          router.push(`/community/report/${data.id}`);
        },
      });
      menus.push({
        key: "block",
        content: "차단",
        onPress: handleBlockUser,
      });
    }

    return menus;
  })();

  const handleArticlePress = () => {
    if (!isDropdownOpen) {
      onPress();
    }
  };

  const redirectDetails = () => router.push(`/community/${data.id}`);

  useEffect(() => {
    setDropdownOpen(false);
  }, [setDropdownOpen]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleArticlePress}
        style={styles.articleTouchable}
        activeOpacity={0.7}
      >
        <UserProfile
          author={author}
          universityName={universityName}
          isOwner={isOwner}
        />

        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text numberOfLines={1} size="md" weight="medium" textColor="black">
              {data.title}
            </Text>

            <LinkifiedText
              size="sm"
              style={styles.contentText}
              textColor="black"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {data.content}
            </LinkifiedText>
          </View>

          {data.images && data.images.length > 0 && (
            <TouchableOpacity
              onPress={redirectDetails}
              activeOpacity={0.85}
              style={styles.imageContainer}
            >
              <View style={styles.imageWrapper}>
                <Image
                  source={{
                    uri: data.images.sort(
                      (a, b) => a.displayOrder - b.displayOrder
                    )[0].imageUrl,
                  }}
                  style={styles.articleImage}
                  resizeMode="cover"
                />
                {data.images.length > 1 && (
                  <View style={styles.imageCountBadge}>
                    <Text size="12" textColor="white" weight="medium">
                      +{data.images.length - 1}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.metaInfoContainer}>
            <Text style={styles.metaText}>
              {dayUtils.formatRelativeTime(data.createdAt)}
            </Text>
            <Text style={[styles.metaText, styles.metaTextWithMargin]}>
              {`·  조회 ${data.readCount}`}
            </Text>
          </View>

          <View style={styles.interactionContainer}>
            <Interaction.Like
              count={data.likeCount}
              isLiked={data.isLiked}
              iconSize={18}
              onPress={handleLike}
            />
            <View style={styles.interactionSpacer} />
            <Interaction.Comment
              count={data.commentCount}
              iconSize={18}
              onPress={onTogglePreview}
            />
          </View>
        </View>

        <Show when={isPreviewOpen}>
          <View style={styles.previewContainer}>
            {comments.map((comment) => (
              <View style={styles.commentContainer} key={comment.id}>
                <Comment data={comment} style={styles.commentMargin} />
                <Divider.Horizontal />
              </View>
            ))}
            {data.commentCount > 3 && (
              <View style={styles.viewMoreContainer}>
                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={redirectDetails}
                >
                  <Text size="sm">답글 더보기</Text>
                  <ImageResource
                    resource={ImageResources.PURPLE_ARROW_RIGHT}
                    width={16}
                    height={16}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Show>
      </TouchableOpacity>

      <View
        style={styles.dropdownContainer}
        onTouchEnd={(e) => {
          e.stopPropagation();
        }}
      >
        <Dropdown
          open={isDropdownOpen}
          items={dropdownMenus}
          onOpenChange={setDropdownOpen}
        />
      </View>

      {!isPreviewOpen && <View style={styles.divider} />}
    </View>
  );
}
