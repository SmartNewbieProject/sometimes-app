import { View, Image, Platform, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import type { Comment as CommentType } from "../../types";
import { dayUtils, getUnivLogo, UniversityName } from "@/src/shared/libs";
import { LinkifiedText, Text } from "@/src/shared/ui";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useState } from "react";

type CommentProps = {
  data: CommentType;
  style?: StyleProp<ViewStyle>;
}

export const Comment = ({ data, style }: CommentProps) => {
  const [imageUri, setImageUri] = useState<string>(() => getUnivLogo(data.author.universityDetails.name as UniversityName));
  const author = data?.author;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.avatar}
          onError={() => {
            setImageUri(getUnivLogo(UniversityName.한밭대학교));
          }}
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text size="13" textColor="black">{author.name}</Text>
          <Text size="sm" textColor="muted">{dayUtils.formatRelativeTime(data.updatedAt)}</Text>
        </View>
        <View style={styles.textContainer}>
          <LinkifiedText
            size="sm"
            textColor="black"
            style={[styles.contentText, {
              lineHeight: Platform.OS === 'ios' ? 18 : 20
            }]}
          >
            {data.content}
          </LinkifiedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    gap: 6,
    width: "100%",
  },
  textContainer: {
    paddingTop: 6,
    flex: 1,
  },
  contentText: {
    flex: 1,
    flexWrap: "wrap",
    flexShrink: 1,
  },
});
