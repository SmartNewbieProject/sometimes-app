import { View, Image, Platform, StyleSheet } from "react-native";
import type { Comment as CommentType } from "../../types";
import { dayUtils, getUnivLogo, UniversityName } from "@/src/shared/libs";
import { LinkifiedText, Text } from "@/src/shared/ui";
import { useState } from "react";

type CommentProps = {
  data: CommentType;
  style?: any;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
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
    flexDirection: 'column',
    gap: 4,
  },
  authorContainer: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
  },
  commentTextContainer: {
    paddingTop: 6,
    flex: 1,
  },
  linkifiedText: {
    flexWrap: 'wrap',
    flexShrink: 1,
    lineHeight: Platform.OS === 'ios' ? 18 : 20,
  },
});

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
          <View style={styles.authorContainer}>
            <Text size="13" textColor="black">{author.name}</Text>
            <Text size="sm" textColor="text-muted">{dayUtils.formatRelativeTime(data.updatedAt)}</Text>
          </View>
          <View style={styles.commentTextContainer}>
            <LinkifiedText
              size="sm"
              textColor="black"
              style={styles.linkifiedText}
            >
              {data.content}
            </LinkifiedText>
          </View>
      </View>
    </View>

  );
};
