import { View, TouchableOpacity, Image } from 'react-native';
import { Divider, Show, Text, ImageResource, dropdownStyles, Dropdown, DropdownItem } from '@/src/shared/ui';
import { IconWrapper } from '@/src/shared/ui/icons';
import type { Article as ArticleType } from '../../types';
import ShieldNotSecuredIcon from '@/assets/icons/shield-not-secured.svg';
import { dayUtils, getUnivLogo, type UniversityName, ImageResources } from '@/src/shared/libs';
import Interaction from './interaction-nav';
import { useEffect } from 'react';
import { useBoolean } from '@/src/shared/hooks/use-boolean';
import { Comment } from '../comment';
import { useCategory } from '../../hooks';
import { useAuth } from '@/src/features/auth';
import { router } from 'expo-router';
import { UserProfile } from '../user-profile';

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
  const { value: showComment, toggle: toggleShowComment, setFalse } = useBoolean();
  const { value: isDropdownOpen, toggle: toggleDropdown, setFalse: closeDropdown } = useBoolean();
  const { currentCategory } = useCategory();

  const isOwner = (() => {
    if (!my) return false;
    return my.id === author.id;
  })();

  const dropdownMenus: DropdownItem[] = (() => {
    const menus: DropdownItem[] = [];
    if (isOwner) {
      const ownerMenus: DropdownItem[] = [
        {
          key: 'update',
          content: '수정',
          onPress: () => {
            router.push(`/community/update/${data.id}`);
          },
        },
        {
          key: 'delete',
          content: '삭제',
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
        key: 'report',
        content: '신고',
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
  }, [currentCategory]);

  return (
    <View className="w-full relative">
      <TouchableOpacity onPress={handleArticlePress} className="p-4 bg-white" activeOpacity={0.7}>

        <UserProfile 
          author={author}
          universityName={universityName} 
          isOwner={isOwner}
        />
        <Text size="md" weight="medium" textColor="black">{data.title}</Text>
        <View className="my-1.5 w-full flex flex-row justify-end">
          <Text size="13" textColor="pale-purple">{dayUtils.formatRelativeTime(data.createdAt)}</Text>
        </View>
        <Text size="sm" className="mb-4 leading-5" textColor="black">
          {data.content}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <Interaction.Like
              count={data.likeCount}
              isLiked={data.isLiked}
              onPress={onLike}
            />
            <Interaction.Comment
              count={data.commentCount}
              onPress={toggleShowComment}
            />
            <Interaction.View count={data.readCount} />
          </View>
        </View>

        <Show when={showComment}>
          <View className="w-full flex flex-col gap-y-1.5 mt-2 px-[24px]">
            {comments.map(comment => (
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
                  <Text size="sm">
                    답글 더보기
                  </Text>
                  <ImageResource resource={ImageResources.PURPLE_ARROW_RIGHT} width={16} height={16} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Show>

      </TouchableOpacity>
        <View className="absolute right-0 top-[12px]" onTouchEnd={(e) => {
          e.stopPropagation();
        }}>
        <Dropdown
          open={isDropdownOpen}
          items={dropdownMenus}
        />
      </View>
    </View>
  );
}
