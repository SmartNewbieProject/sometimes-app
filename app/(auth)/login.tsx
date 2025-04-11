import { View } from 'react-native';
import { PalePurpleGradient } from '@/src/shared/ui/gradient';
import Signup from '@features/signup';

export default function LoginScreen() {
  return (
    <View className="flex-1">
      <PalePurpleGradient />
      <View className="flex-1 px-5 pt-10">
        <Signup.Logo />
        <Signup.LoginForm />
      </View>
    </View>
  );
}
