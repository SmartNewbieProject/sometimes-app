import colors , { semanticColors } from "@/src/shared/constants/colors";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HomeInfoCardProps {
  buttonMessage: string;
  title: string;
  imageUri: string;
  description: string;
  buttonDisabled?: boolean;
  onClick: () => void;
}

function HomeInfoCard({
  buttonMessage,
  title,
  buttonDisabled = false,
  onClick,
  description,
  imageUri,
}: HomeInfoCardProps) {
  return (
    <TouchableOpacity
      disabled={buttonDisabled}
      onPress={onClick}
      style={styles.container}
    >
      <Image source={imageUri} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View
        style={[styles.button, buttonDisabled && styles.buttonDisabledStyle]}
      >
        <Text
          style={[
            styles.buttonText,
            buttonDisabled && styles.buttonDisabledText,
          ]}
        >
          {buttonMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(134, 56, 229, 0.5)",
    backgroundColor: semanticColors.surface.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 82,
    height: 90,
  },
  title: {
    marginTop: 8,
    marginBottom: 2,
    color: semanticColors.text.primary,
    textAlign: "center",
    fontSize: 18,
    fontFamily: "semibold",
    fontWeight: 600,
    lineHeight: 21.6,
  },
  description: {
    color: semanticColors.text.disabled,
    textAlign: "center",
    fontSize: 12,
    marginBottom: 11,
    fontFamily: "light",
    fontWeight: 300,
    lineHeight: 13.4,
  },
  button: {
    borderRadius: 20,
    borderWidth: 0,
    width: 90,
    height: 30,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: semanticColors.surface.other,
  },
  buttonDisabledStyle: {
    backgroundColor: semanticColors.brand.primary,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "semibold",
    fontWeight: 600,
    lineHeight: 18,
    color: semanticColors.brand.primary,
  },
  buttonDisabledText: {
    color: semanticColors.text.inverse,
  },
});

export default HomeInfoCard;
