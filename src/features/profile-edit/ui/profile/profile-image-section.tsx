import { useAuth } from "@/src/features/auth";
import ChangeProfileImageModal from "@/src/features/mypage/ui/modal/change-profile-image.modal";
import { OverlayProvider } from "@/src/shared/hooks/use-overlay";
import React, { useState } from "react";
import { Modal, Text } from "react-native";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import ProfileImageCard from "./profile-image-card";
import ProfileImageCover from "./profile-image-cover";

import { useProfileImageCover } from "@/src/features/profile-edit/hooks/use-profile-image-cover";

function ProfileImageSection() {
  const { profileDetails } = useAuth();
  const [isProfileImageOpen, setProfileOpen] = useState(false);

  //테스트용 상수
  // const isApproved = true;
  const { isCoverVisible } = useProfileImageCover();

  const sortedPorifleImages = profileDetails?.profileImages.sort((a, b) => {
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    return 0;
  });

  const handleProfileImageOpen = () => {
    setProfileOpen(true);
  };
  const handleProfileImageClose = () => {
    setProfileOpen(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>프로필 사진</Text>

        <View style={styles.cardWrapper}>
          <ScrollView
            style={styles.cardContainer}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            {sortedPorifleImages?.map((image) => (
              <ProfileImageCard
                key={image.id}
                imageUri={image.url}
                onClick={handleProfileImageOpen}
                isMain={image.isMain}
              />
            ))}
            {sortedPorifleImages &&
              Array(Math.max(0, 3 - sortedPorifleImages?.length))
                .fill(true)
                .map((none, index) => (
                  <ProfileImageCard
                    onClick={handleProfileImageOpen}
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    key={index}
                    noneImage={none}
                  />
                ))}
          </ScrollView>

          <ProfileImageCover visible={isCoverVisible} />
          {/* <ProfileImageCover visible={!!isApproved} /> */}
        </View>

        <View style={styles.bar} />
      </View>

      <Modal
        visible={isProfileImageOpen}
        transparent={true}
        animationType="slide"
        style={{ position: "relative" }}
      >
        <OverlayProvider>
          <ChangeProfileImageModal onCloseModal={handleProfileImageClose} />
        </OverlayProvider>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingLeft: 26,
    paddingRight: 26,
  },
  title: {
    color: "#000",
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 21.6,
    fontWeight: 600 as any,
    marginBottom: 12,
  },

  cardWrapper: {
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
  },

  cardContainer: {
    paddingRight: 0,
    borderRadius: 20,
  },
  bar: {
    marginRight: 28,
    height: 0.5,
    backgroundColor: "#E7E9EC",
    marginTop: 12,
  },
});

export default ProfileImageSection;
