import { View, StyleSheet } from "react-native";
import { ImageResource, Text } from '@shared/ui';
import { ImageResources } from "@/src/shared/libs";

export const PreOpening = () => {
  return (
    <View style={styles.container}>
      <View style={styles.foxContainer}>
        <ImageResource
          resource={ImageResources.PLITE_FOX}
          width={148}
          height={148}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text textColor="deepPurple" weight="semibold" size="20" style={styles.mainTitle}>
            설레는 만남을 위해 준비 중이에요.
          </Text>
          <Text weight="semibold" size="18" style={styles.subTitle}>
            곧 다시 찾아올게요&nbsp;💜
          </Text>
        </View>

        <Text textColor="pale-purple" style={styles.scheduleText}>
          썸타임은 매주 목·일 21시에 매칭이 시작돼요!
        </Text>
      </View>

      <ImageResource
        resource={ImageResources.DISAPPEAR_FOX}
        style={styles.bottomFox}
        width={148}
        height={148}
      />
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    padding: 14,
    flex: 1,
    flexDirection: 'column',
  },
  foxContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  contentContainer: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,
  },
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 18,
  },
  subTitle: {
    fontSize: 16,
    marginTop: 6,
  },
  scheduleText: {
    fontSize: 12,
    marginTop: 8,
  },
  bottomFox: {
    position: 'absolute',
    bottom: -24,
    left: -30,
    zIndex: -1,
  },
});
