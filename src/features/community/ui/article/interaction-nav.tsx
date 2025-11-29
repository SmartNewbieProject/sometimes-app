import CommentIcon from "@/assets/icons/engagement.svg";
import HeartIcon from "@/assets/icons/heart.svg";
import EyesIcon from "@/assets/icons/ph_eyes-fill.svg";
import { ImageResources } from "@/src/shared/libs";
import { ImageResource, Text } from "@/src/shared/ui";
import { IconWrapper } from "@shared/ui/icons";
import {
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
} from "react-native";
import type { Article } from "../../types";

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
  Like: React.FC<LikeProps>;
  Comment: React.FC<InteractionItemProps>;
  View: React.FC<InteractionItemProps>;
} = ({ data, onLike, onComment, onViews }) => {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-4">
        <Interaction.Like
          count={data.likeCount}
          onPress={onLike}
          isLiked={data.isLiked}
        />
        <Interaction.Comment count={data.comments.length} onPress={onComment} />
        <Interaction.View count={data.readCount} onPress={onViews} />
      </View>
    </View>
  );
};

type LikeProps = InteractionItemProps & { isLiked: boolean };

Interaction.Like = ({ count, iconSize = 24, isLiked, ...props }: LikeProps) => {
  return (
    <TouchableOpacity className="flex-row items-center gap-2" {...props}>
      <IconWrapper size={iconSize}>
        {isLiked ? (
          <ImageResource resource={ImageResources.HEART_ON} />
        ) : (
          <HeartIcon stroke="#646464" />
        )}
      </IconWrapper>
      <Text size="13" className="text-text-muted">
        {count}
      </Text>
    </TouchableOpacity>
  );
};

Interaction.Like.displayName = 'InteractionLike';

Interaction.Comment = ({
  count,
  iconSize = 24,
  ...props
}: InteractionItemProps) => {
  return (
    <TouchableOpacity className="flex-row items-center gap-2" {...props}>
      <IconWrapper size={iconSize}>
        <CommentIcon strokeWidth={1} stroke="#646464" />
      </IconWrapper>
      <Text size="13" className="text-text-muted">
        {count}
      </Text>
    </TouchableOpacity>
  );
};

Interaction.Comment.displayName = 'InteractionComment';

Interaction.View = ({
  count,
  iconSize = 24,
  ...props
}: InteractionItemProps) => {
  return (
    <TouchableOpacity className="flex-row items-center gap-2" {...props}>
      <IconWrapper size={iconSize}>
        <EyesIcon stroke="#646464" />
      </IconWrapper>
      <Text size="13" className="text-text-muted">
        {count}
      </Text>
    </TouchableOpacity>
  );
};

Interaction.View.displayName = 'InteractionView';

export default Interaction;
