import { View, StyleSheet } from "react-native";
import colors from '../../constants/colors';
import { semanticColors } from '../../constants/semantic-colors';

interface GlowingCardProps {
  children: React.ReactNode;
}

export const GlowingCard = ({ children, ...props }: GlowingCardProps) => {
  return (
    <View style={styles.container} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    borderColor: colors.white,
    borderRadius: 16,
    backgroundColor: semanticColors.surface.secondary,
    borderWidth: 1,
    boxShadow: "0 2px 10px 0 rgba(122, 74, 226, 0.78)",
    paddingVertical: 15,
    paddingHorizontal: 17,
  },
});
