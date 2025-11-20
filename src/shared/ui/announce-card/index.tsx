import { cva } from "class-variance-authority";
import { TouchableOpacity } from "react-native";
import { ImageResources } from "../../libs";
import { ImageResource } from "../image-resource";
import { Text } from "../text";

type AnnounceCardProps = {
  emoji?: ImageResources;
  emojiSize?: {
    width: number;
    height: number;
  };
  textSize?:
    | "10"
    | "13"
    | "sm"
    | "md"
    | "18"
    | "20"
    | "12"
    | "chip"
    | "lg"
    | null
    | undefined;
  text: string;
  onPress: () => void;
  theme?: "default" | "alert";
};

const cardClass = cva(
  [
    "w-full h-[42px]",
    "flex flex-row items-center gap-x-2.5 px-4",
    "rounded-[20px]",
  ],
  {
    variants: {
      theme: {
        default: "bg-moreLightPurple",
        alert: "bg-surface-background",
      },
    },
    defaultVariants: {
      theme: "default",
    },
  }
);

const textClass = cva("", {
  variants: {
    theme: {
      default: "text-brand-deep",
      alert: "text-[#FF813C]",
    },
  },

  defaultVariants: {
    theme: "default",
  },
});

export const AnnounceCard = ({
  emoji,
  emojiSize,
  text,
  textSize = "13",
  onPress,
  theme = "default",
}: AnnounceCardProps) => {
  return (
    <TouchableOpacity
      className={cardClass({ theme })}
      activeOpacity={0.4}
      onPress={onPress}
    >
      {theme === "alert" && (
        <ImageResource
          resource={ImageResources.ANNOUNCEMENT_ALERT}
          width={emojiSize?.width || 24}
          height={emojiSize?.height || 24}
        />
      )}
      {emoji && (
        <ImageResource
          resource={emoji}
          width={emojiSize?.width || 24}
          height={emojiSize?.height || 24}
        />
      )}
      <Text size={textSize} weight="bold" className={textClass({ theme })}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};
