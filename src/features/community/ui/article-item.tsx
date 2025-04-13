import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/src/shared/ui';
import { IconWrapper } from '@/src/shared/ui/icons';
import HeartIcon from '@/assets/icons/heart.svg';
import CommentIcon from '@/assets/icons/engagement.svg';
import EyesIcon from '@/assets/icons/ph_eyes-fill.svg';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Article } from '../types';
import ShieldNotSecuredIcon from '@/assets/icons/shield-not-secured.svg';
interface ArticleItemProps {
  article: Article;
}

export function ArticleItem({ article }: ArticleItemProps) {
  return (
    <View>
      <TouchableOpacity className="p-4 bg-white" activeOpacity={0.7}>
        <View className="flex-row items-center mb-2">
          <Image 
            source={article.author.university.image}
            style={{ width: 32, height: 32 }}
            className="rounded-full mr-2"
          />
          <View>
            <Text size="sm" weight="medium" textColor="black">{article.author.name}</Text>
            <Text size="13" textColor="purple" className="opacity-70">
              {article.author.age}세 
              <Text> · </Text>
              {article.author.university.name}
              <IconWrapper size={13}>
                <ShieldNotSecuredIcon/>
              </IconWrapper>
            </Text>
          </View>
        </View>
        <Text size="md" weight="medium" textColor="black">{article.title}</Text>
        <Text size="sm" className="mb-3 leading-5" textColor="black">
          {article.content}
        </Text>

        <View className="flex-row justify-between px-4">
          <TouchableOpacity className="flex-row items-center gap-1">
            <IconWrapper size={18}>
              <HeartIcon />
            </IconWrapper>
            <Text size="sm" textColor="black">{article.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-1">
            <IconWrapper size={18}>
              <CommentIcon />
            </IconWrapper>
            <Text size="sm" textColor="black">{article.comments?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center gap-1">
            <IconWrapper size={18}>
              <EyesIcon />
            </IconWrapper>
            <Text size="sm" textColor="black">{article.shares}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <View className="h-[1px] bg-[#F3F0FF]" />
    </View>
  );
} 