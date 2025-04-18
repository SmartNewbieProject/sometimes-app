import { cn, platform } from "@/src/shared/libs";
import { Button } from "@shared/ui";
import { View } from "react-native";

type Props = {
  onClickPrevious: () => void;
  onClickNext: () => void;
  content?: {
    prev?: string;
    next?: string;
  };
  disabledNext: boolean;
  classNames?: string;
}

export const TwoButtons = ({ onClickNext, onClickPrevious, content, classNames, disabledNext }: Props) => {
  return (
    <View
      className={cn([
        "flex flex-row gap-x-2",
        platform({
          web: () => "px-5 mb-[14px] md:mb-[72px] w-full flex flex-row gap-x-[15px]",
          android: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
          ios: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
          default: () => ""
        }),
        classNames
      ])}
    >
      <Button
        variant="secondary"
        className="flex-[0.3]"
        onPress={onClickPrevious}
      >
        {content?.prev || '뒤로'}
      </Button>
      <Button
        className="flex-[0.7]"
        onPress={onClickNext}
        disabled={disabledNext}
      >
        {content?.next || '다음으로'}
      </Button>
    </View>
  );
};
