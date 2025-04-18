import { Stack } from 'expo-router';
import { View } from 'react-native';



export default function CommingSoonLayout() {
    return (
        <View className="flex-1">
          <Stack>
            <Stack.Screen 
              name="index" 
              options={{ 
                headerShown: false,
                contentStyle: {
                  backgroundColor: 'transparent',
                },
              }} 
            />
          </Stack>
        </View>
      );
}
