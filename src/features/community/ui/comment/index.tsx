import { View, Image, Platform } from "react-native";
import type { Comment as CommentType } from "../../types";
import { dayUtils, getUnivLogo, UniversityName } from "@/src/shared/libs";
import { LinkifiedText, Text } from "@/src/shared/ui";
import { useState } from "react";

type CommentProps = {
  data: CommentType;
  className?: string;
}

export const Comment = ({ data, className }: CommentProps) => {
  const [imageUri, setImageUri] = useState<string>(() => getUnivLogo(data.author.universityDetails.name as UniversityName));
  const author = data?.author;

  return (
    <View className={`w-full flex-row ${className}`}>
      <View className="mr-2">
        <Image
          source={{ uri: imageUri }}
          style={{ width: 36, height: 36 }}
          onError={() => {
            setImageUri(getUnivLogo(UniversityName.한밭대학교));
          }}
          className="rounded-full"
        />
      </View>

        <View className="flex-1 flex-col gap-y-1">
          <View className=" flex-row gap-x-1.5 w-full">
            <Text size="13" textColor="black">{author.name}</Text>
            <Text size="sm" className="text-[#646464]">{dayUtils.formatRelativeTime(data.updatedAt)}</Text>
          </View>
          <View className="pt-1.5 flex-1">
            <LinkifiedText
              size="sm"
              textColor="black"
              className="flex-1"
              style={{
                flexWrap: 'wrap',
                flexShrink: 1,
                lineHeight: Platform.OS === 'ios' ? 18 : 20
              }}
            >
              {data.content}
            </LinkifiedText>
          </View>
      </View>
    </View>
    
  );
};
