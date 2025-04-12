import { View } from 'react-native';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import Signup from '@features/signup';
import { platform } from '@shared/libs/platform';
import { cn } from '@shared/libs/cn';

export default function LoginScreen() {
  return (
    <View className="flex-1 h-full">
      <PalePurpleGradient />
      <View className="h-full" style={{
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
            paddingTop: 12,
            paddingHorizontal: 0,
          }),
        })  
      }}>
        <View className={cn(
          'px-4',
          platform({
            web: () => "h-screen overflow-auto flex flex-col justify-center",
            default: () => ""
          })
        )}>
          <Signup.Logo />
          <Signup.LoginForm />
        </View>
      </View>
    </View>
  );
}
