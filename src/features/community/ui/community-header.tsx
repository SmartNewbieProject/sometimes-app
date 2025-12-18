import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Text } from '@/src/shared/ui';
import { IconWrapper } from '@/src/shared/ui/icons';
import StopwatchIcon from '@/assets/icons/ph_eyes-fill.svg';
import FireIcon from '@/assets/icons/heart.svg';
import BellIcon from '@/assets/icons/bell.svg';
import CommunityIcon from '@/assets/icons/community.svg';

interface Props {
  activeTab: "realtime" | "popular";
  onChangeTab: (tab: "realtime" | "popular") => void;
}

export function CommunityHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.spacer} />
        <View style={styles.centerContent}>
          <IconWrapper>
            <CommunityIcon width={151} height={17} />
          </IconWrapper>
        </View>
        <View style={styles.rightContent}>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
            <IconWrapper size={20}>
              <BellIcon />
            </IconWrapper>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.surface.background,
  },
  headerRow: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  spacer: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
  },
  rightContent: {
    flex: 1,
    alignItems: "flex-end",
  },
  bellButton: {
    padding: 8,
  },
});
