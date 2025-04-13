import { View, TouchableOpacity, Text as RNText } from 'react-native';
import { Article } from '../types';
import { useRouter } from 'expo-router';
import { Text } from '@/src/shared/ui';
import { IconWrapper } from '@/src/shared/ui/icons';
import HeartIcon from '@/assets/icons/heart.svg';
import CommentIcon from '@/assets/icons/engagement.svg';
import Eyes from '@/assets/icons/ph_eyes-fill.svg';

interface ArticleItemProps {
  article: Article;
}

export function ArticleItem({ article }: ArticleItemProps) {
  const router = useRouter();

  return (
    <TouchableOpacity className="p-4">
      <View className="flex-row items-center mb-3">
        <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center mr-2">
          <Text size="md" textColor="purple" weight="bold">
            {article.author.name[0]}
          </Text>
        </View>
        <Text size="sm" weight="medium">
          {article.author.name}
        </Text>
      </View>

      <RNText className="text-base leading-6 mb-4 text-gray-900" numberOfLines={2}>
        {article.content}
      </RNText>

      <View className="flex-row gap-4">
        <TouchableOpacity className="flex-row items-center gap-1" activeOpacity={0.7}>
          <IconWrapper size={20}>
            <HeartIcon />
          </IconWrapper>
          <Text size="sm">{article.likes || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center gap-1" activeOpacity={0.7}>
          <IconWrapper size={20}>
            <CommentIcon />
          </IconWrapper>
          <Text size="sm">{article.comments?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center gap-1" activeOpacity={0.7}>
          <IconWrapper size={20}>
            <Eyes />
          </IconWrapper>
          <Text size="sm">{article.shares || 0}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
} 