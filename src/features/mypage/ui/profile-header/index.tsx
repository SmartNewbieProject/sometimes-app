import { useAuth } from "@/src/features/auth";
import { semanticColors } from '../../../../shared/constants/colors';
import { useModal } from "@/src/shared/hooks/use-modal";
import { Text } from "@/src/shared/ui/text";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HamburgerIcon from "@/assets/icons/hamburger.svg";

export const ProfileHeader = () => {
  const { profileDetails } = useAuth();
  const { showModal } = useModal();
  const insets = useSafeAreaInsets();

  const profileData = {
    name: profileDetails?.name || "김썸타",
    statusMessage: profileDetails?.statusMessage || "오늘도 즐거운 썸타임!",
    profileImage:
      profileDetails?.profileImages?.find((image) => image.isMain)?.url ||
      require("@/assets/images/profile.png"),
  };

  const handleMenuPress = () => {
    // TODO: 메뉴 모달 구현
    showModal({
      title: "메뉴",
      children: (
        <View>
          <Text>설정</Text>
          <Text>알림</Text>
          <Text>로그아웃</Text>
        </View>
      ),
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <Pressable onPress={handleMenuPress} style={styles.menuButton}>
          <HamburgerIcon width={24} height={24} />
        </Pressable>

        <View style={styles.profileInfo}>
          <Image
            source={profileData.profileImage}
            style={styles.profileImage}
          />
          <View style={styles.textContainer}>
            <Text style={styles.name}>{profileData.name}</Text>
            <Text style={styles.statusMessage}>{profileData.statusMessage}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 16,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: semanticColors.text.primary,
    marginBottom: 2,
  },
  statusMessage: {
    fontSize: 14,
    color: semanticColors.text.disabled,
    fontWeight: "400",
  },
});

export default ProfileHeader;