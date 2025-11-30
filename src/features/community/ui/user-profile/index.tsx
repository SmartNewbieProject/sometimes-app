import type { Author } from "@/src/features/community/types";
import { type UniversityName, getUnivLogo } from "@/src/shared/libs/univ";
import { Show, Text } from "@/src/shared/ui";
import { semanticColors } from "@/src/shared/constants/colors";
import type { ReactNode } from "react";
import { Image, View, StyleSheet } from "react-native";

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
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: getUnivLogo(universityName) }}
        style={styles.univLogo}
      />

      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text size="sm" weight="medium" textColor="black">
                {author.name}
              </Text>
              <Show when={isOwner}>
                <Text size="sm" style={styles.meText} textColor="pale-purple">
                  (나)
                </Text>
              </Show>
              <Show when={!!updatedAt}>
                <View style={styles.updatedAtContainer}>
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
    flexDirection: 'row',
    flexShrink: 1,
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  univLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  meText: {
    marginLeft: 4,
  },
  updatedAtContainer: {
    paddingLeft: 6,
  },
  univText: {
    opacity: 0.7,
  },
});
