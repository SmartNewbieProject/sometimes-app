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

interface ArticleItemProps {
  data: ArticleType;
  onPress: () => void;
  onLike: () => void;
  refresh: () => Promise<void>;
  onDelete: (id: string) => void;
}

export function Article({ data, onPress, onLike, onDelete }: ArticleItemProps) {
  const { my } = useAuth();
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
        content: "신고",
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
                color: "#676767",
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
                color: "#676767",
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
              onPress={toggleShowComment}
            />
          </View>
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
