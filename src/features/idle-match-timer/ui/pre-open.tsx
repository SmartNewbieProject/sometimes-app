import { View, StyleSheet } from "react-native";
import { ImageResource, Text } from '@shared/ui';
import { ImageResources } from "@/src/shared/libs";
import { useTranslation } from "react-i18next";

export const PreOpening = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.foxContainer}>
        <ImageResource
          resource={ImageResources.PLITE_FOX}
          style={styles.foxImage}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.textCenter}>
          <Text textColor="deepPurple" weight="semibold" size="20">
            {t("features.idle-match-timer.ui.pre-open.title")}
          </Text>
          <Text weight="semibold" size="18" style={styles.subTitle}>
            {t("features.idle-match-timer.ui.pre-open.subtitle")}
          </Text>
        </View>

        <Text textColor="pale-purple" style={styles.infoText}>
          {t("features.idle-match-timer.ui.pre-open.info")}
        </Text>
      </View>

      <ImageResource
        resource={ImageResources.DISAPPEAR_FOX}
        style={styles.disappearFox}
        width={238}
        height={238}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    padding: 14,
    flexDirection: "column",
  },
  foxContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  foxImage: {
    width: 148,
    height: 148,
  },
  contentContainer: {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
  },
  textCenter: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subTitle: {
    marginTop: 6,
  },
  infoText: {
    fontSize: 12,
    marginTop: 8,
  },
  disappearFox: {
    width: 148,
    height: 148,
    position: "absolute",
    bottom: -24,
    left: -30,
    zIndex: -1,
  },
});
