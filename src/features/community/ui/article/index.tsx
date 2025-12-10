import { useAuth } from "@/src/features/auth";
import { semanticColors } from '../../../../shared/constants/colors';
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
import { Image, ScrollView, TouchableOpacity, View } from "react-native";

import type { Article as ArticleType } from "../../types";
import { Comment } from "../comment";
import { UserProfile } from "../user-profile";
import Interaction from "./interaction-nav";
import { useBlockUser } from "../../hooks/use-block-user";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useTranslation } from "react-i18next";
interface ArticleItemProps {
  data: ArticleType;
  onPress: () => void;
  onLike: () => void;
  refresh: () => void;
  onDelete: (id: string) => void;
  isPreviewOpen: boolean;
  onTogglePreview: () => void;
}

export function Article({
  data,
  onPress,
  onLike,
  onDelete,
  isPreviewOpen,
  onTogglePreview,
}: ArticleItemProps) {
  const { my } = useAuth();
  const { t } = useTranslation();
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
          content: t("features.community.ui.article.edit_button"),
          onPress: () => {
            router.push(`/community/update/${data.id}`);
          },
        },
        {
          key: "delete",
          content: t("features.community.ui.article.delete_button"),
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
        content: t("features.community.ui.article.report_button"),
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
    <View className="w-full relative">
      <TouchableOpacity
        testID={`article-item-${data.id}`}
        onPress={handleArticlePress}
        className="p-4 bg-transparent"
        activeOpacity={0.7}
      >
        <UserProfile
          author={author}
          universityName={universityName}
          isOwner={isOwner}
        />

        <View className="mx-[8px] mt-3 mb-4 flex-row items-start gap-3">
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} size="md" weight="medium" textColor="black">
              {data.title}
            </Text>

            <LinkifiedText
              size="sm"
              className="mt-2 leading-5"
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
              style={{ width: 70, height: 70 }}
            >
              <View
                className="relative rounded-lg overflow-hidden bg-gray-100"
                style={{ width: 70, height: 70 }}
              >
                <Image
                  source={{
                    uri: data.images.sort(
                      (a, b) => a.displayOrder - b.displayOrder
                    )[0].imageUrl,
                  }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                {data.images.length > 1 && (
                  <View
                    className="absolute right-1 bottom-1 rounded px-2 py-[2px]"
                    style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                  >
                    <Text size="12" textColor="white" weight="medium">
                      +{data.images.length - 1}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View className="mx-[8px] mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text
              style={{
                color: semanticColors.text.muted,
                fontFamily: "Pretendard",
                fontSize: 13,
                fontStyle: "normal",
                fontWeight: "300" as any,
                lineHeight: 14.4,
                fontFeatureSettings: "'liga' off, 'clig' off",
              }}
            >
              {dayUtils.formatRelativeTime(data.createdAt)}
            </Text>
            <Text
              style={{
                color: semanticColors.text.muted,
                fontFamily: "Pretendard",
                fontSize: 13,
                fontStyle: "normal",
                fontWeight: "300" as any,
                lineHeight: 14.4,
                fontFeatureSettings: "'liga' off, 'clig' off",
                marginLeft: 8,
              }}
            >
              {`·  조회 ${data.readCount}`}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Interaction.Like
              count={data.likeCount}
              isLiked={data.isLiked}
              iconSize={18}
              onPress={handleLike}
            />
            <View style={{ width: 12 }} />
            <Interaction.Comment
              count={data.commentCount}
              iconSize={18}
              onPress={onTogglePreview}
            />
          </View>
        </View>

        <Show when={isPreviewOpen}>
          <View className="w-full flex flex-col gap-y-1.5 mt-6 px-[18px]">
            {comments.map((comment) => (
              <View className="w-full flex flex-col" key={comment.id}>
                <Comment data={comment} className="mb-[6px]" />
                <Divider.Horizontal />
              </View>
            ))}
            {data.commentCount > 3 && (
              <View className="w-full flex flex-row justify-end my-1">
                <TouchableOpacity
                  className="flex-row items-center gap-x-1"
                  onPress={redirectDetails}
                >
                  <Text size="sm">{t("features.community.ui.article.view_more_replies")}</Text>
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
        className="absolute right-[8px] top-[12px]"
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

      {!isPreviewOpen && <View className="h-[1px] bg-surface-other" />}
    </View>
  );
}
