import React from 'react';
import { View } from 'react-native';
import { useStorage } from '../hooks/use-storage';
import { Button } from '../ui/button';
import { Text } from '../ui/text';

interface User {
  name: string;
  age: number;
}

export const StorageExample = () => {
  const {
    value: user,
    setValue: setUser,
    removeValue: removeUser,
    loading,
    error
  } = useStorage<User>({
    key: '@user',
    initialValue: { name: '홍길동', age: 20 }
  });

  const handleUpdateUser = () => {
    setUser({ name: '김철수', age: 25 });
  };

  if (loading) {
    return <Text>로딩 중...</Text>;
  }

  if (error) {
    return <Text textColor="purple">에러: {error.message}</Text>;
  }

  return (
    <View className="p-4">
      <Text className="mb-4">
        현재 사용자: {user?.name}, {user?.age}세
      </Text>
      
      <View className="flex-row space-x-2">
        <Button 
          variant="primary" 
          onPress={handleUpdateUser}
        >
          사용자 업데이트
        </Button>
        
        <Button 
          variant="secondary" 
          onPress={removeUser}
        >
          사용자 삭제
        </Button>
      </View>
    </View>
  );
}; 