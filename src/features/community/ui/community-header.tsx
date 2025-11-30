import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '@/src/shared/ui';
import { IconWrapper } from '@/src/shared/ui/icons';
import { semanticColors } from '@/src/shared/constants/colors';
import StopwatchIcon from '@/assets/icons/ph_eyes-fill.svg';
import FireIcon from '@/assets/icons/heart.svg';
import BellIcon from '@/assets/icons/bell.svg';
import CommunityIcon from '@/assets/icons/community.svg';
// features/community/ui/CommunityHeader.tsx
interface Props {
  activeTab: "realtime" | "popular";
  onChangeTab: (tab: "realtime" | "popular") => void;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.surface.background,
  },
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  leftSection: {
    flex: 1,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  bellButton: {
    padding: 8,
  },
  communityIcon: {
    width: 151,
    height: 17,
  },
});

export function CommunityHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.leftSection}>
          {/* Empty view for spacing */}
        </View>
        <View style={styles.centerSection}>
          <IconWrapper >
            <CommunityIcon style={styles.communityIcon} />
          </IconWrapper>
        </View>
        <View style={styles.rightSection}>
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
