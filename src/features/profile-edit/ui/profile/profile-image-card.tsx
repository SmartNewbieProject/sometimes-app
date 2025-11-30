import { Image } from "expo-image";
import { semanticColors } from '@/src/shared/constants/colors';
import React from "react";
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
  if (noneImage) {
    return (
      <Pressable onPress={onClick} style={[styles.card, styles.noneCard]}>
        <Image
          source={require("@assets/images/image.png")}
          style={styles.noneImage}
        />
        <Text style={styles.noneText}>사진 추가하기</Text>
        <View style={[styles.imageTag, styles.noneImageTag]}>
          <Text style={styles.imageTagText}>{isMain ? "대표" : "선택"}</Text>
        </View>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onClick} style={styles.card}>
      <Image source={imageUri} style={styles.image} />
      <View style={styles.imageTag}>
        <Text style={styles.imageTagText}>{isMain ? "대표" : "선택"}</Text>
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
    borderColor: semanticColors.brand.primary,
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
    backgroundColor: semanticColors.brand.primary,
    borderBottomLeftRadius: 20,
  },
  imageTagText: {
    fontSize: 13,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 15.6,
    fontWeight: 600,

    color: semanticColors.text.inverse,
  },
  edit: {
    position: "absolute",
    bottom: 9,
    right: 9,
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: "hidden",
    backgroundColor: semanticColors.surface.background,
    justifyContent: "center",
    alignItems: "center",
  },
  editPencil: {
    width: 22,
    height: 22,
  },
  noneCard: {
    borderColor: semanticColors.border.default,
    backgroundColor: semanticColors.surface.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  noneImageTag: {
    backgroundColor: semanticColors.surface.other,
  },
  noneImage: {
    height: 78,
    width: 78,
  },
  noneText: {
    color: semanticColors.text.disabled,
    fontSize: 13,
    fontFamily: "Pretendard-Light",
    fontWeight: 300,

    lineHeight: 15.6,
  },
});

export default ProfileImageCard;
