import CommentIcon from "@/assets/icons/engagement.svg";
import HeartIcon from "@/assets/icons/heart.svg";
import EyesIcon from "@/assets/icons/ph_eyes-fill.svg";
import { ImageResources } from "@/src/shared/libs";
import { ImageResource, Text } from "@/src/shared/ui";
import { IconWrapper } from "@shared/ui/icons";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import {
  StyleSheet,
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
    <View style={styles.container}>
      <View style={styles.itemsRow}>
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
    <TouchableOpacity style={styles.interactionItem} {...props}>
      <IconWrapper size={iconSize}>
        {isLiked ? (
          <ImageResource resource={ImageResources.HEART_ON} />
        ) : (
          <HeartIcon stroke="#646464" />
        )}
      </IconWrapper>
      <Text size="13" textColor="muted">
        {count}
      </Text>
    </TouchableOpacity>
  );
};

Interaction.Comment = ({
  count,
  iconSize = 24,
  ...props
}: InteractionItemProps) => {
  return (
    <TouchableOpacity style={styles.interactionItem} {...props}>
      <IconWrapper size={iconSize}>
        <CommentIcon strokeWidth={1} stroke="#646464" />
      </IconWrapper>
      <Text size="13" textColor="muted">
        {count}
      </Text>
    </TouchableOpacity>
  );
};

Interaction.View = ({
  count,
  iconSize = 24,
  ...props
}: InteractionItemProps) => {
  return (
    <TouchableOpacity style={styles.interactionItem} {...props}>
      <IconWrapper size={iconSize}>
        <EyesIcon stroke="#646464" />
      </IconWrapper>
      <Text size="13" textColor="muted">
        {count}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  interactionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default Interaction;
