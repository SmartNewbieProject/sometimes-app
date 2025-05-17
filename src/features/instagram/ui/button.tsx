import { Button, ImageResource } from "@/src/shared/ui";
import { ImageResources } from "@/src/shared/libs";
import { openInstagram } from "../services";
import { Alert } from "react-native";

type InstagramContactButtonProps = {
  instagramId: string;
};

export const InstagramContactButton = ({ instagramId }: InstagramContactButtonProps) => {
  const handlePress = () => {
    if (!instagramId || instagramId.trim() === '') {
      Alert.alert('알림', '상대방이 인스타그램 아이디를 등록하지 않았습니다.');
      return;
    }

    // 인스타그램 ID가 있는 경우 연결 시도
    openInstagram(instagramId);
  };

  return (
    <Button
      variant="outline"
      className="flex-1 w-full"
      onPress={handlePress}
      prefix={<ImageResource resource={ImageResources.INSTAGRAM}
        width={32}
        height={32}
      />}
    >
      연락하기
    </Button>
  );
};
