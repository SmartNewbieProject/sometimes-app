import { ImageResources } from "@/src/shared/libs";
import { Button, ImageResource } from "@/src/shared/ui";
import { openInstagram } from "../services";

type InstagramContactButtonProps = {
  instagramId: string;
};

export const InstagramContactButton = ({
  instagramId,
}: InstagramContactButtonProps) => (
  <Button
    variant="outline"
    styles={{
      flex: 1,
      alignItems: "center",
      width: "100%",
      height: 50,
    }}
    onPress={() => openInstagram(instagramId)}
    prefix={
      <ImageResource
        resource={ImageResources.INSTAGRAM}
        width={32}
        height={32}
      />
    }
  >
    연락하기
  </Button>
);
