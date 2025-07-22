import { useAuth } from "@/src/features/auth";
import ChangeProfileImageModal from "@/src/features/mypage/ui/modal/change-profile-image.modal";
import React, { useState } from "react";
import { Modal, Text } from "react-native";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import ProfileImageCard from "./profile-image-card";

function ProfileImageSection() {
  const { profileDetails } = useAuth();
  const [isProfileImageOpen, setProfileOpen] = useState(false);
  console.log(profileDetails, "profileDetails");
  const sortedPorifleImages = profileDetails?.profileImages.sort((a, b) => {
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    return 0;
  });

  const handleProfileImageOpen = () => {
    console.log("profile open");
    setProfileOpen(true);
  };
  const handleProfileImageClose = () => {
    setProfileOpen(false);
  };
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>프로필 사진</Text>
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
            Array(3 - sortedPorifleImages?.length)
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
        <View style={styles.bar} />
      </View>
      <Modal
        visible={isProfileImageOpen}
        transparent={true}
        animationType="slide"
      >
        <ChangeProfileImageModal onCloseModal={handleProfileImageClose} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingLeft: 26,
  },
  title: {
    color: "#000",
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 21.6,
    marginBottom: 12,
  },
  cardContainer: {
    paddingRight: 0,
  },
  bar: {
    marginRight: 28,
    height: 0.5,
    backgroundColor: "#E7E9EC",
    marginTop: 12,
  },
});

export default ProfileImageSection;
