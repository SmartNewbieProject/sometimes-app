import {ImageResources} from "@shared/libs/image";
import { semanticColors } from '../../../../shared/constants/colors';
import {ImageResource, Text } from "@shared/ui";
import {Dimensions, Pressable, StyleSheet, View} from "react-native";
import { router } from 'expo-router';

export const Banner = () => {
  const width = Dimensions.get("window").width;
  const height = (() => {
    if (width > 400) {
      return 280;
    }
    return 260;
  })();

  return (
      <View style={styles.container}>
        <ImageResource
            resource={ImageResources.GEM_STORE_BANNER}
            style={{width: "100%", height}}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  guideButton: {
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 8,
    width: 'auto',
    borderRadius: 8,
    position: "absolute",
    top: 8,
    right: 8,
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    columnGap: 4,
  }
});
