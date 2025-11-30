import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';



export default function CommingSoonLayout() {
    return (
        <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
