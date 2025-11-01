import { useAppFont } from "@/src/shared/hooks/use-app-font";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ProfileImageCardProps {
  imageUri?: string;
  onClick?: () => void;
  isMain?: boolean;
  noneImage?: boolean;
}

function ProfileImageCard({
  imageUri = "",
  onClick = () => {},
  isMain = false,
  noneImage = false,
}: ProfileImageCardProps) {
  const { t } = useTranslation();
  if (noneImage) {
    return (
      <Pressable onPress={onClick} style={[styles.card, styles.noneCard]}>
        <Image
          source={require("@assets/images/image.png")}
          style={styles.noneImage}
        />
        <Text style={styles.noneText}>{t("features.profile-edit.ui.profile.image_card.add_photo")}</Text>
        <View style={[styles.imageTag, styles.noneImageTag]}>
          <Text style={styles.imageTagText}>{isMain ? t("features.profile-edit.ui.profile.image_card.main") : t("features.profile-edit.ui.profile.image_card.select")}</Text>
        </View>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onClick} style={styles.card}>
      <Image source={imageUri} style={styles.image} />
      <View style={styles.imageTag}>
        <Text style={styles.imageTagText}>{isMain ? t("features.profile-edit.ui.profile.image_card.main") : t("features.profile-edit.ui.profile.image_card.select")}</Text>
      </View>
      <View style={styles.edit}>
        <Image
          source={require("@assets/images/edit-pencil.png")}
          style={styles.editPencil}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    height: 150,
    borderRadius: 20,
    borderWidth: 2,
    position: "relative",
    marginRight: 10,
    overflow: "hidden",
    borderColor: "#7A4AE2",
  },
  image: {
    width: 150,
    height: 150,
  },
  imageTag: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 46,
    height: 29,

    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7A4AE2",
    borderBottomLeftRadius: 20,
  },
  imageTagText: {
    fontSize: 13,
    fontFamily: useAppFont("semibold"),
    lineHeight: 15.6,
    fontWeight: 600,

    color: "#fff",
  },
  edit: {
    position: "absolute",
    bottom: 9,
    right: 9,
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: "hidden",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  editPencil: {
    width: 22,
    height: 22,
  },
  noneCard: {
    borderColor: "#E2D5FF",
    backgroundColor: "#F3EDFF",
    justifyContent: "center",
    alignItems: "center",
  },
  noneImageTag: {
    backgroundColor: "#E2D5FF",
  },
  noneImage: {
    height: 78,
    width: 78,
  },
  noneText: {
    color: "#9B94AB",
    fontSize: 13,
    fontFamily:  useAppFont("light"),
    fontWeight: 300,

    lineHeight: 15.6,
  },
});

export default ProfileImageCard;
