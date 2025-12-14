import { useModal } from "@/src/shared/hooks/use-modal";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Header } from "@/src/shared/ui";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMyInfoForm } from "../../my-info/hooks";

function ProfileEditHeader() {
  const router = useRouter();
  const { clear } = useMyInfoForm();
  const { showModal } = useModal();
  const { t } = useTranslation();

  return (
    <Header.Container className="items-center  ">
      <Header.LeftContent>
        <Pressable
          onPress={() => {
            showModal({
              title: t("features.profile-edit.ui.header.modal_title"),
              children:
                t("features.profile-edit.ui.header.modal_description"),
              primaryButton: {
                text: t("features.profile-edit.ui.header.modal_primary_button"),
                onClick: () => {
                  return;
                },
              },
              secondaryButton: {
                text: t("features.profile-edit.ui.header.modal_secondary_button"),
                onClick: () => {
                  router.navigate("/my");
                  clear();
                },
              },
            });
          }}
          style={styles.arrowContainer}
        >
          <View style={styles.backArrow} />
        </Pressable>
      </Header.LeftContent>
      <Header.CenterContent>
        <Text style={styles.headerTitle}>{t("features.profile-edit.ui.header.title")}</Text>
      </Header.CenterContent>

      <Header.RightContent>
        <View />
      </Header.RightContent>
    </Header.Container>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    color: semanticColors.text.primary,
    fontSize: 20,
    fontFamily: "bold",
    fontWeight: 700,
    lineHeight: 22,
  },
  backArrow: {
    width: 12.6,
    height: 12.6,
    top: 3,
    left: 3,
    position: "absolute",
    borderLeftWidth: 2,
    borderLeftColor: "#000",
    borderTopWidth: 2,
    borderTopColor: "#000",
    transform: [{ rotate: "-45deg" }],
    borderRadius: 2,
  },
  arrowContainer: {
    width: 24,
    height: 24,
  },
});

export default ProfileEditHeader;
