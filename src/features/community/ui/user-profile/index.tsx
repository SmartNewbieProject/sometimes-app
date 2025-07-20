import type { Author } from "@/src/features/community/types";
import { type UniversityName, getUnivLogo } from "@/src/shared/libs/univ";
import { Show, Text } from "@/src/shared/ui";
import type { ReactNode } from "react";
import { Image, View } from "react-native";

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
    <View className="flex flex-row flex-shrink items-center  mb-2 relative">
      <Image
        source={{ uri: getUnivLogo(universityName) }}
        style={{ width: 32, height: 32 }}
        className="rounded-full mr-3 self-start"
      />

      <View className="flex-1 relative">
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-col flex-1">
            <View className="flex flex-row flex-wrap">
              <Text size="sm" weight="medium" textColor="black">
                {author.name}
              </Text>
              <Show when={isOwner}>
                <Text size="sm" className="ml-1" textColor="pale-purple">
                  (나)
                </Text>
              </Show>
              <Show when={!!updatedAt}>
                <View className="pl-1.5">
                  <Text size="sm" textColor="pale-purple">
                    {updatedAt}
                  </Text>
                </View>
              </Show>
            </View>
          </View>
        </View>

        <Show when={!hideUniv}>
          <Text size="13" textColor="purple" className="opacity-70">
            만 {author.age}세<Text> · </Text>
            {universityName}
          </Text>
        </Show>
      </View>
    </View>
  );
};
