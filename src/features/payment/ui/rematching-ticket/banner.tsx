import { ImageResources } from "@/src/shared/libs/image";
import { ImageResource } from "@/src/shared/ui";
import { View } from "react-native";

export const Banner = () => (
  <View>
    <ImageResource
      resource={ImageResources.REMATCHING_TICKET_BANNER}
      style={{ width: '100%', height: 240 }}
    />
  </View>
);
