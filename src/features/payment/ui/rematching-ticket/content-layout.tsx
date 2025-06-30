import { View } from "react-native";

import colors from "@/src/shared/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, ScrollView, StyleSheet } from "react-native";

type Props = {
  children: React.ReactNode;
}
export const ContentLayout = ({ children }: Props) => {
  return (
    <View style={styles.shadowWrapper}>
    {Platform.OS === 'web' && (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 32, // 원하는 만큼
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(186,156,238,0.9) 0%, rgba(186,156,238,0.0) 100%)',
        }}
      />
    )}
      <ScrollView style={[
        styles.container,
      ]}>
          <LinearGradient
            colors={['rgba(186,156,238,0.40)', 'rgba(186,156,238,0.2)', 'rgba(186,156,238,0)']}
            style={styles.topShadow}
            pointerEvents="none"
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        {children}
      </ScrollView>      
    </View>

  );
};

const styles = StyleSheet.create({
  shadowWrapper: {
    shadowColor: colors.primaryPurple,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.26,
    shadowRadius: 12,
    width: '100%',
    backgroundColor: 'transparent',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flex: 1,
  },
  container: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flex: 1,
    backgroundColor: '#F3EEFC',
    flexDirection: 'column',
    display: 'flex',
    height: '100%'
  },
  topShadow: {
    height: 32,
  },
});
