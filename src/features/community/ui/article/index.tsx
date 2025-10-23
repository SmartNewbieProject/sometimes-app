import { useAuth } from "@/src/features/auth";
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
import { useTranslation } from "react-i18next";
interface ArticleItemProps {
  data: ArticleType;
  onPress: () => void;
  onLike: () => void;
  refresh: () => Promise<void>;
  onDelete: (id: string) => void;
}

export function Article({ data, onPress, onLike, onDelete }: ArticleItemProps) {
  const { my } = useAuth();
  const { t } = useTranslation();
  const author = data?.author;
  const comments = data.comments;
  const university = author?.universityDetails;
  const universityName = university?.name as UniversityName;
  const {
    value: showComment,
    toggle: toggleShowComment,
    setFalse,
  } = useBoolean();
  const { value: isDropdownOpen, setFalse: closeDropdown } = useBoolean();

  const isOwner = (() => {
    if (!my) return false;
    return my.id === author.id;
  })();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const handleLike = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onLike();
  }, []);

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
            closeDropdown();
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
    setFalse();
    closeDropdown();
  }, [setFalse, closeDropdown]);

  return (
    <View className="w-full relative">
      <TouchableOpacity
        onPress={handleArticlePress}
        className="p-4 bg-white"
        activeOpacity={0.7}
      >
        <UserProfile
          author={author}
          universityName={universityName}
          isOwner={isOwner}
        />

        <View className="my-3 mb-4 mx-[8px]  flex flex-row justify-between">
          <Text numberofLine={1} size="md" weight="medium" textColor="black">
            {data.title}
          </Text>
          <Text size="13" textColor="pale-purple">
            {dayUtils.formatRelativeTime(data.createdAt)}
          </Text>
        </View>
        <LinkifiedText
          size="sm"
          className="mb-4 mx-[8px] leading-5"
          textColor="black"
          style={{ flexWrap: "wrap", flexShrink: 1 }}
        >
          {data.content}
        </LinkifiedText>

        {data.images && data.images.length > 0 && (
          <View className="mx-[8px] mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {data.images
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .slice(0, 3)
                  .map((image) => (
                    <Image
                      key={`preview-image-${image.id}`}
                      source={{ uri: image.imageUrl }}
                      className="w-20 h-20 rounded-lg"
                      resizeMode="cover"
                    />
                  ))}
                {data.images.length > 3 && (
                  <View className="w-20 h-20 rounded-lg bg-gray-200 items-center justify-center">
                    <Text className="text-gray-600 text-xs">
                      +{data.images.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        )}

        <View className="flex-row items-center  mx-[8px]   justify-between">
          <Interaction.Like
            count={data.likeCount}
            isLiked={data.isLiked}
            iconSize={24}
            onPress={handleLike}
          />
          <Interaction.Comment
            count={data.commentCount}
            iconSize={24}
            onPress={toggleShowComment}
          />
          <Interaction.View iconSize={20} count={data.readCount} />
        </View>

        <Show when={showComment}>
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
        <Dropdown open={isDropdownOpen} items={dropdownMenus} />
      </View>
      {!showComment && <View className="h-[1px] bg-[#F3F0FF]" />}
    </View>
  );
}
