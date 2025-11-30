import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text } from "@/src/shared/ui";
import { useAuth } from "../../auth";
import PurpleRightArrow from '@assets/icons/purple-arrow.svg';
import { router } from "expo-router";

export const CommunityAnnouncement = () => {
  const { profileDetails } = useAuth();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.navigate('/community')}
    >
      <View style={styles.contentContainer}>
        <Text textColor="black" size="lg" weight="medium">
          {profileDetails?.name || '회원'}님도 가능해요
        </Text>
        <Text textColor="black" size="lg" weight="medium">
          연애 성공 후기, 한번 확인해 보세요!
        </Text>
      </View>
      <View style={styles.arrowContainer}>
        <PurpleRightArrow />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentContainer: {
    marginVertical: 25, // my-[25px]
  },
  arrowContainer: {
    marginTop: 16, // mt-4 (16px = 1rem)
  },
});
