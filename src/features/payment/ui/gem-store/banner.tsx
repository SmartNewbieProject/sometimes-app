import {ImageResources} from "@shared/libs/image";
import {ImageResource, Text } from "@shared/ui";
import {Dimensions, Pressable, StyleSheet, View} from "react-native";

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
        <Pressable style={styles.guideButton}>
          <ImageResource
            resource={ImageResources.TICKET}
            width={36}
            height={36}
          />
          <Text weight="bold" textColor="black" size="12">
            기존 재매칭권은 어떻게 되나요?
          </Text>
        </Pressable>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  guideButton: {
    backgroundColor: "white",
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
