import { View, Image } from 'react-native';
import { Text, Show } from '@/src/shared/ui';
import { getUnivLogo, type UniversityName } from '@/src/shared/libs/univ';
import type { Author } from '@/src/features/community/types';
import type { ReactNode } from 'react';

interface UserProfileProps {
  author: Author;
  universityName: UniversityName;
  isOwner: boolean;
  updatedAt?: ReactNode;
  hideUniv?: boolean;
  comment?: ReactNode;
}

export const UserProfile = ({ author, universityName, isOwner, comment, updatedAt, hideUniv = false }: UserProfileProps) => {
  return (
    <View className="flex flex-row items-center mb-2 relative">
      <Image
        source={{ uri: getUnivLogo(universityName) }}
        style={{ width: 32, height: 32 }}
        className="rounded-full mr-2"
      />
      <View className="w-full relative">
        <View className="flex flex-row items-center justify-between">

          <View className="flex flex-col">
            <View className="flex flex-row">
              <Text size="sm" weight="medium" textColor="black">{author.name}</Text>
              <Show when={isOwner}>
                <Text size="sm" className="ml-1" textColor="pale-purple">(나)</Text>
              </Show>
              <Show when={!!updatedAt}>
                <View className="pl-1.5">
                  {updatedAt}
                </View>
              </Show>
            </View>
            <Show when={!!comment}>
              <View className="pt-1.5">
                {comment}
              </View>
            </Show>
          </View>

        </View>
        <Show when={!hideUniv}>
          <Text size="13" textColor="purple" className="opacity-70">
            {author.age}세
            <Text> · </Text>
            {universityName}
          </Text>
        </Show>
      </View>
    </View>
  );
};
