import { StyleSheet, View } from 'react-native';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text, Header as SharedHeader } from '@shared/ui';
import { ImageResource } from "@ui/image-resource";
import { ImageResources } from "@shared/libs";
import { router } from 'expo-router';
import { useTranslation } from "react-i18next";
import colors from "@/src/shared/constants/colors";

type HeaderProps = {
  gemCount: number;
}

export const Header = ({ gemCount }: HeaderProps) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <SharedHeader.LeftButton visible={true} onPress={() => router.back()} />
      <Text size="20" weight="bold" textColor="black">{t("features.payment.ui.gem_store.header_title")}</Text>
      <View style={styles.gemContainer}>
        <ImageResource resource={ImageResources.GEM} width={28} height={28} />
        <Text style={styles.gemCount}>
          {gemCount}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: semanticColors.surface.background,
  },
  gemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gemCount: {
    color: colors.black,
    fontSize: 15,
  },
});

