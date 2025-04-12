import { View } from 'react-native';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import Signup from '@features/signup';
import { cn } from '@shared/libs/cn';
import { platform } from '@shared/libs/platform';

export default function LoginScreen() {
  return (
    <View className="flex-1">
      <PalePurpleGradient />
      <View style={{
        ...platform({
          ios: () => ({
            paddingTop: 48,
            paddingHorizontal: 8,
          }),
          android: () => ({
            paddingTop: 48,
            paddingHorizontal: 8,
          }),
          web: () => ({
            paddingTop: 32,
            paddingHorizontal: 8,
          }),
        })  
      }}>
        <Signup.Logo />
        <Signup.LoginForm />
      </View>
    </View>
  );
}
