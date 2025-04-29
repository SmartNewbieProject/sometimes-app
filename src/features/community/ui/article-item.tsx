import { View, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { Text } from '@/src/shared/ui';
import { IconWrapper } from '@/src/shared/ui/icons';
import { Article } from '../types';
import ShieldNotSecuredIcon from '@/assets/icons/shield-not-secured.svg';
import HeartIcon from '@/assets/icons/heart.svg';
import CommentIcon from '@/assets/icons/engagement.svg';
import EyesIcon from '@/assets/icons/ph_eyes-fill.svg';
import { getUnivLogo, UniversityName } from '@/src/shared/libs';

interface ArticleItemProps {
  article: Article;
  onPress: () => void;
  onLike: () => void;
  onComment: () => void;
  onViews: () => void;
}

export function ArticleItem({ article, onPress, onLike, onComment, onViews }: ArticleItemProps) {
  const university = article.author.universityDetails;
  const universityName = university.name as UniversityName;
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
            <Text size="sm" weight="medium" textColor="black">{article.author.name}</Text>
            <Text size="13" textColor="purple" className="opacity-70">
              {article.author.age}세
              <Text> · </Text>
              {universityName}
              <IconWrapper size={13}>
                <ShieldNotSecuredIcon />
              </IconWrapper>
            </Text>
          </View>
        </View>

        <Text size="md" weight="medium" textColor="black">{article.title}</Text>
        <Text size="sm" className="mb-4 leading-5" textColor="black">
          {article.content}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity className="flex-row items-center gap-2" onPress={onLike}>
              <IconWrapper size={20}>
                <HeartIcon stroke="#646464" />
              </IconWrapper>
              <Text className="text-[16px] h-[24px]  text-[#646464]">{article.likeCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center gap-2" onPress={onComment}>
              <IconWrapper size={20}>
                <CommentIcon stroke="#646464" />
              </IconWrapper>
              <Text className="text-[16px] h-[24px]text-[#646464]">{article.comments.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center gap-2" onPress={onViews}>
              <IconWrapper size={16} >
                <EyesIcon stroke="#646464" />
              </IconWrapper>
              <Text className="text-[16px] h-[24px] text-[#646464]" >{article.readCount}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </TouchableOpacity>
    </View>
  );
} 