import { useAuth } from "@/src/features/auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import ChangeProfileImageModal from "@/src/features/mypage/ui/modal/change-profile-image.modal";
import { OverlayProvider } from "@/src/shared/hooks/use-overlay";
import React, { useEffect, useState, useMemo } from "react";
import { Modal, Text , StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import ProfileImageCard from "./profile-image-card";
import ProfileImageCover from "./profile-image-cover";
import { useTranslation } from 'react-i18next';
import { useProfileImageCover } from "@/src/features/profile-edit/hooks/use-profile-image-cover";
import { useRouter } from "expo-router";
import { useManagementSlots } from "@/src/features/profile/queries/use-management-slots";
import { PhotoStatusWrapper } from "@/src/widgets";

function ProfileImageSection() {
  const { t } = useTranslation();
  const { profileDetails } = useAuth();
  const router = useRouter();
  const [isProfileImageOpen, setProfileOpen] = useState(false);

  const [refreshKey, setRefreshKey] = useState<number>(Date.now());

  const { isCoverVisible, refetch } = useProfileImageCover();
  const { data: managementData } = useManagementSlots();

  useEffect(() => {
    setRefreshKey(Date.now());
    refetch();
  }, [refetch]);

  const sortedSlots = useMemo(() => {
    if (!managementData?.images) return [];
    return managementData.images
      .map((image, index) => ({ image, slotIndex: index }))
      .filter(slot => slot.image !== null)
      .sort((a, b) => {
        if (a.image?.isMain && !b.image?.isMain) return -1;
        if (!a.image?.isMain && b.image?.isMain) return 1;
        return 0;
      });
  }, [managementData?.images]);

  const handleProfileImageOpen = () => {
    router.push('/profile/photo-management?referrer=profile-edit');
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
            {sortedSlots?.map((slot) => (
              <View key={slot.image?.id} style={styles.imageCardWrapper}>
                <PhotoStatusWrapper
                  reviewStatus={slot.image?.reviewStatus}
                  rejectionReason={slot.image?.rejectionReason}
                  isMain={slot.image?.isMain}
                  onReupload={handleProfileImageOpen}
                >
                  <ProfileImageCard
                    imageUri={slot.image?.imageUrl || slot.image?.url}
                    onClick={handleProfileImageOpen}
                    isMain={slot.image?.isMain}
                  />
                </PhotoStatusWrapper>
              </View>
            ))}
            {sortedSlots &&
              Array(Math.max(0, 3 - sortedSlots?.length))
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
  imageCardWrapper: {
    width: 150,
    height: 150,
    marginRight: 10,
    overflow: 'hidden',
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
