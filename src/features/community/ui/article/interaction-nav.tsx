import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { Text } from '@/src/shared/ui';
import HeartIcon from '@/assets/icons/heart.svg';
import CommentIcon from '@/assets/icons/engagement.svg';
import EyesIcon from '@/assets/icons/ph_eyes-fill.svg';
import { Article } from '../../types';
import { IconWrapper } from '@shared/ui/icons';

interface InteractionProps {
  data: Article;
}

interface InteractionItemProps extends TouchableOpacityProps {
  count: number;
  iconSize?: number;
}

interface InteractionComponentProps extends InteractionProps {
  onLike?: () => void;
  onComment?: () => void;
  onViews?: () => void;
}

const Interaction: React.FC<InteractionComponentProps> & {
  Like: React.FC<InteractionItemProps>;
  Comment: React.FC<InteractionItemProps>;
  View: React.FC<InteractionItemProps>;
} = ({ data, onLike, onComment, onViews }) => {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-4">
        <Interaction.Like count={data.likeCount} onPress={onLike} />
        <Interaction.Comment count={data.comments.length} onPress={onComment} />
        <Interaction.View count={data.readCount} onPress={onViews} />
      </View>
    </View>
  );
};

Interaction.Like = ({ count, iconSize = 24, ...props }: InteractionItemProps) => {
  return (
    <TouchableOpacity className="flex-row items-center gap-2" {...props}>
      <IconWrapper size={iconSize}>
        <HeartIcon stroke="#646464" />
      </IconWrapper>
      <Text size="13" className="text-[#646464]">{count}</Text>
    </TouchableOpacity>
  );
};

Interaction.Comment = ({ count, iconSize = 24, ...props }: InteractionItemProps) => {
  return (
    <TouchableOpacity className="flex-row items-center gap-2" {...props}>
      <IconWrapper size={iconSize}>
        <CommentIcon stroke="#646464" />
      </IconWrapper>
      <Text size="13" className="text-[#646464]">{count}</Text>
    </TouchableOpacity>
  );
};

Interaction.View = ({ count, iconSize = 24, ...props }: InteractionItemProps) => {
  return (
    <TouchableOpacity className="flex-row items-center gap-2" {...props}>
      <IconWrapper size={iconSize}>
        <EyesIcon stroke="#646464" />
      </IconWrapper>
      <Text size="13" className="text-[#646464]">{count}</Text>
    </TouchableOpacity>
  );
};

export default Interaction;