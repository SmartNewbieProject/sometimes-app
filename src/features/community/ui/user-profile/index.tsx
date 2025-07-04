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
    <View className="flex flex-row w-full items-center ml-[8px] mb-2 relative">
      <Image
        source={{ uri: getUnivLogo(universityName) }}
        style={{ width: 32, height: 32 }}
        className="rounded-full mr-2 self-start"
      />

      <View className="flex-1 relative">
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-col flex-1">
            <View className="flex flex-row flex-wrap">
              <Text size="sm" weight="medium" textColor="black">{author.name}</Text>
              <Show when={isOwner}>
                <Text size="sm" className="ml-1" textColor="pale-purple">(나)</Text>
              </Show>
              <Show when={!!updatedAt}>
                <View className="pl-1.5">
                  <Text size="sm" textColor="pale-purple">{updatedAt}</Text>
                </View>
              </Show>
            </View>

            <Show when={!!comment}>
              <View className="pt-1.5" style={{ flex: 1, flexDirection: 'row' }}>
                <Text
                  size="sm"
                  textColor="black"
                  style={{
                    flex: 1,
                    flexWrap: 'wrap',
                    flexShrink: 1
                  }}
                >
                  {comment}
                </Text>
              </View>
            </Show>
          </View>
        </View>

        <Show when={!hideUniv}>
          <Text size="13" textColor="purple" className="opacity-70">
            만 {author.age}세
            <Text> · </Text>
            {universityName}
          </Text>
        </Show>
      </View>
    </View>
  );
};
