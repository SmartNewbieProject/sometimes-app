import React from 'react';
import { View, Image } from 'react-native';
import { Text, Show } from '@/src/shared/ui';
import { getUnivLogo, UniversityName } from '@/src/shared/libs/univ';
import type { Author } from '@/src/features/community/types';

interface UserProfileProps {
  author: Author;
  universityName: UniversityName;
  isOwner: boolean;
}

export const UserProfile = ({ author, universityName, isOwner }: UserProfileProps) => {
  return (
    <View className="flex-row items-center mb-2 relative">
      <Image
        source={{ uri: getUnivLogo(universityName) }}
        style={{ width: 32, height: 32 }}
        className="rounded-full mr-2"
      />
      <View className="w-full relative">
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row">
            <Text size="sm" weight="medium" textColor="black">{author.name}</Text>
            <Show when={isOwner}>
              <Text size="sm" className="ml-1" textColor="pale-purple">(나)</Text>
            </Show>
          </View>
        </View>
        <Text size="13" textColor="purple" className="opacity-70">
          {author.age}세
          <Text> · </Text>
          {universityName}
        </Text>
      </View>
    </View>
  );
};
