import { View, TouchableOpacity, Image } from 'react-native';
import { Divider, Show, Text } from '@/src/shared/ui';
import { IconWrapper } from '@/src/shared/ui/icons';
import { Article as ArticleType } from '../../types';
import ShieldNotSecuredIcon from '@/assets/icons/shield-not-secured.svg';
import { getUnivLogo, UniversityName } from '@/src/shared/libs';
import Interaction from './interaction-nav';
import { useEffect, useState } from 'react';
import { useBoolean } from '@/src/shared/hooks/use-boolean';
import { Comment } from '../comment';
import { useCategory } from '../../hooks';

interface ArticleItemProps {
  data: ArticleType;
  onPress: () => void;
  onLike: () => void;
  onComment: () => void;
}

export function Article({ data, onPress, onLike, onComment }: ArticleItemProps) {
  const author = data?.author;
  const comments = data.comments;
  const university = author?.universityDetails;
  const universityName = university?.name as UniversityName;
  const { value: showComment, toggle: toggleShowComment, setFalse } = useBoolean();
  const { currentCategory } = useCategory();

  useEffect(() => {
    setFalse();
  }, [currentCategory]);

  return (
    <View>
      <TouchableOpacity onPress={onPress} className="p-4 bg-white" activeOpacity={0.7}>
        <View className="flex-row items-center mb-2">
          <Image
            source={{ uri: getUnivLogo(universityName) }}
            style={{ width: 32, height: 32 }}
            className="rounded-full mr-2"
          />
          <View>
            <Text size="sm" weight="medium" textColor="black">{author.name}</Text>
            <Text size="13" textColor="purple" className="opacity-70">
              {author.age}세
              <Text> · </Text>
              {universityName}
              <IconWrapper size={13}>
                <ShieldNotSecuredIcon />
              </IconWrapper>
            </Text>
          </View>
        </View>

        <Text size="md" weight="medium" textColor="black" className="mb-2">{data.title}</Text>
        <Text size="sm" className="mb-4 leading-5" textColor="black">
          {data.content}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <Interaction.Like count={data.likeCount} />
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
            <View className="w-full flex flex-row justify-end my-1">
              <TouchableOpacity>
                <Text size="sm">
                  답글 더보기
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Show>

      </TouchableOpacity>
    </View>
  );
} 