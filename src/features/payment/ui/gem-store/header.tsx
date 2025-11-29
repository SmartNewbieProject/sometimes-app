import { View, StyleSheet } from 'react-native';
import { semanticColors } from '../../../../shared/constants/colors';
import { Text , Header as SharedHeader } from '@shared/ui';
import { ImageResource } from "@ui/image-resource";
import {ImageResources} from "@shared/libs";
import { router } from 'expo-router';


type HeaderProps = {
  gemCount: number;
}

export const Header = ({ gemCount }: HeaderProps) => {
  return (
    <View style={styles.container}>
      <SharedHeader.LeftButton visible={true} onPress={() => router.back()} />
      <Text size="20" weight="bold" textColor="black">구슬 스토어</Text>
      <View style={styles.gemCountContainer}>
        <ImageResource resource={ImageResources.GEM} width={28} height={28} />
        <Text style={styles.gemCountText}>
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
    backgroundColor: semanticColors.surface.background
  },
  gemCountContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row'
  },
  gemCountText: {
    color: semanticColors.text.primary,
    fontSize: 15
  }
});

