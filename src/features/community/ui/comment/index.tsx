import { View, Image } from "react-native";
import { Comment as CommentType } from "../../types";
import { dayUtils, getUnivLogo, UniversityName } from "@/src/shared/libs";
import { Text } from "@/src/shared/ui";
import { useState } from "react";

type CommentProps = {
  data: CommentType;
  className?: string;
}

export const Comment = ({ data, className }: CommentProps) => {
  const [imageUri, setImageUri] = useState<string>(() => getUnivLogo(data.author.universityDetails.name as UniversityName));
  const author = data?.author;

  return (
    <View className={`w-full flex flex-row ${className}`}>
      <View className="flex-row items-center mb-2">
        <Image
          source={{ uri: imageUri }}
          style={{ width: 36, height: 36 }}
          onError={err => {
            setImageUri(getUnivLogo(UniversityName.한밭대학교));
          }}
          className="rounded-full mr-2"
        />
      </View>
      <View className="flex flex-col gap-y-1">
        <View className="flex flex-row gap-x-1.5">
          <Text size="13" textColor="black">{author.name}</Text>
          <Text size="sm" className="text-[#646464]">{dayUtils.formatRelativeTime(data.updatedAt)}</Text>
        </View>

        <Text size="sm" textColor="black">
          {data.content}
        </Text>
      </View>
    </View>
  );
};
