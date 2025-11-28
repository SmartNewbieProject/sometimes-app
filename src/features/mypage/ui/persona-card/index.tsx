import { useAuth } from "@/src/features/auth";
import { semanticColors } from '../../../../shared/constants/colors';
import { Text } from "@/src/shared/ui/text";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet } from "react-native";

export const PersonaCard = () => {
  const { profileDetails } = useAuth();

  // Mock data - 추후 API 연동 필요
  const personaData = {
    mbti: profileDetails?.mbti || "ENTP",
    relationshipStatus: profileDetails?.relationshipStatus || "솔로",
    age: profileDetails?.age || 25,
    zodiac: profileDetails?.zodiac || "물병자리"
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#9747FF", "#7A4AE2"]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.mbtiSection}>
            <Text style={styles.mbtiText}>{personaData.mbti}</Text>
            <Text style={styles.mbtiLabel}>MBTI</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>상태</Text>
              <Text style={styles.infoValue}>{personaData.relationshipStatus}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>나이</Text>
              <Text style={styles.infoValue}>{personaData.age}세</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>별자리</Text>
              <Text style={styles.infoValue}>{personaData.zodiac}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  mbtiSection: {
    flex: 1,
    alignItems: "center",
  },
  mbtiText: {
    fontSize: 32,
    fontWeight: "700",
    color: semanticColors.text.inverse,
    marginBottom: 4,
  },
  mbtiLabel: {
    fontSize: 12,
    color: semanticColors.text.inverse,
    fontWeight: "500",
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: semanticColors.surface.background,
    marginHorizontal: 20,
    opacity: 0.3,
  },
  infoSection: {
    flex: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: semanticColors.text.inverse,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: semanticColors.text.inverse,
    fontWeight: "600",
  },
});

export default PersonaCard;