import { useAuth } from "@/src/features/auth";
import { semanticColors } from '../../../../shared/constants/colors';
import ChangeProfileImageModal from "@/src/features/mypage/ui/modal/change-profile-image.modal";
import { OverlayProvider } from "@/src/shared/hooks/use-overlay";
import React, { useEffect, useState, useMemo } from "react";
import { Modal, Text , StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import ProfileImageCard from "./profile-image-card";
import ProfileImageCover from "./profile-image-cover";
import { useTranslation } from 'react-i18next';
import { useProfileImageCover } from "@/src/features/profile-edit/hooks/use-profile-image-cover";

function ProfileImageSection() {
  const { t } = useTranslation();
  const { profileDetails } = useAuth();
  const [isProfileImageOpen, setProfileOpen] = useState(false);

  const [refreshKey, setRefreshKey] = useState<number>(Date.now());

  const { isCoverVisible, refetch } = useProfileImageCover();

  useEffect(() => {
    setRefreshKey(Date.now());
    refetch();
  }, [refetch]);

  const sortedPorifleImages = useMemo(() => {
    const list = profileDetails?.profileImages ?? [];
    return [...list].sort((a, b) => {
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      return 0;
    });
  }, [profileDetails?.profileImages]);

  const handleProfileImageOpen = () => {
    setProfileOpen(true);
  };
  const handleProfileImageClose = () => {
    setProfileOpen(false);

    refetch();
  };

  return (
    <>
      <View key={refreshKey} style={styles.container}>
        <Text style={styles.title}>{t("features.profile-edit.ui.profile.image_section.title")}</Text>

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
                    key={index}
                    noneImage={none}
                  />
                ))}
          </ScrollView>

          <ProfileImageCover visible={isCoverVisible} />
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
    color: semanticColors.text.primary,
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
    backgroundColor: semanticColors.surface.other,
    marginTop: 12,
  },
});

export default ProfileImageSection;
