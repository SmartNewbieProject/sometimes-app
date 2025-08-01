import {ImageResources} from "@/src/shared/libs/image";
import {ImageResource} from "@/src/shared/ui";
import {Dimensions, View} from "react-native";

export const Banner = () => {
  const width = Dimensions.get("window").width;
  const height = (() => {
    if (width > 400) {
      return 280;
    }
    return 260;
  })();

  return (
      <View>
        <ImageResource
            resource={ImageResources.GEM_STORE_BANNER}
            style={{width: "100%", height}}
        />
      </View>
  );
};
