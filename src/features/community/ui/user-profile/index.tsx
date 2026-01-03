import type { Author } from "@/src/features/community/types";
import { type UniversityName, getUnivLogo } from "@/src/shared/libs/univ";
import { Show, Text } from "@/src/shared/ui";
import type { ReactNode } from "react";
import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";

const DEFAULT_AVATAR = require("@assets/images/sometimelogo.webp");

interface UserProfileProps {
  author: Author;
  universityName: UniversityName;
  isOwner: boolean;
  updatedAt?: ReactNode;
  hideUniv?: boolean;
}

export const UserProfile = ({
  author,
  universityName,
  isOwner,
  updatedAt,
  hideUniv = false,
}: UserProfileProps) => {
  const [imageError, setImageError] = useState(false);
  const logoUri = getUnivLogo(universityName);

  return (
    <View style={styles.container}>
      <Image
        source={imageError || !logoUri ? DEFAULT_AVATAR : { uri: logoUri }}
        style={styles.avatar}
        onError={() => setImageError(true)}
      />

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <View style={styles.nameColumn}>
            <View style={styles.nameWrapper}>
              <Text size="sm" weight="medium" textColor="black">
                {author.name}
              </Text>
              <Show when={isOwner}>
                <Text size="sm" style={styles.ownerBadge} textColor="pale-purple">
                  (나)
                </Text>
              </Show>
              <Show when={!!updatedAt}>
                <View style={styles.updatedAtWrapper}>
                  <Text size="sm" textColor="pale-purple">
                    {updatedAt}
                  </Text>
                </View>
              </Show>
            </View>
          </View>
        </View>

        <Show when={!hideUniv}>
          <Text size="13" textColor="purple" style={styles.univText}>
            {author.age}
            <Text> · </Text>
            {universityName}
          </Text>
        </Show>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexShrink: 1,
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    alignSelf: "flex-start",
  },
  content: {
    flex: 1,
    position: "relative",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameColumn: {
    flexDirection: "column",
    flex: 1,
  },
  nameWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  ownerBadge: {
    marginLeft: 4,
  },
  updatedAtWrapper: {
    paddingLeft: 6,
  },
  univText: {
    opacity: 0.7,
  },
});
