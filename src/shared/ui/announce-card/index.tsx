import { TouchableOpacity } from "react-native";
import { cn, ImageResources } from "../../libs";
import { ImageResource } from "../image-resource";
import { Text } from "../text";

type AnnounceCardProps = {
  emoji: ImageResources;
  emojiSize?: {
    width: number;
    height: number;
  }
  text: string;
  onPress: () => void;
};

export const AnnounceCard = ({ emoji, emojiSize, text, onPress }: AnnounceCardProps) => {
  return (
    <TouchableOpacity
      className={cn([
        'w-full h-[42px]',
        'flex flex-row items-center gap-x-2.5 px-4',
        'bg-moreLightPurple rounded-[20px]',
      ])}
      activeOpacity={0.4}
      onPress={onPress}
    >
      <ImageResource resource={emoji} width={emojiSize?.width || 24} height={emojiSize?.height || 24} />
      <Text size="13" weight="bold" textColor="deepPurple">{text}</Text>
    </TouchableOpacity>
  );
};
