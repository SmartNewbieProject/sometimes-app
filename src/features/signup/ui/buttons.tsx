import { Button } from '@/src/shared/ui/button';
import { platform } from '@shared/libs/platform';
import { router } from 'expo-router';
import { View } from 'react-native';

interface SignupButtonsProps {
	onPress?: () => void;
	onPassLogin?: () => void;
}

export default function SignupButtons({ onPress, onPassLogin }: SignupButtonsProps) {
	return (
		<View
			className="mt-flex flex-col px-2 gap-y-2"
			style={{
				...platform({
					ios: () => ({
						paddingTop: 58,
						paddingBottom: 58,
					}),
					android: () => ({
						paddingTop: 58,
						paddingBottom: 58,
					}),
					web: () => ({
						paddingTop: 14,
						paddingBottom: 0,
					}),
				}),
			}}
		>
			{onPassLogin ? (
				<Button size="md" variant="primary" onPress={onPassLogin} className="w-full">
					PASS 인증으로 로그인
				</Button>
			) : (
				<>
					<Button size="md" variant="primary" onPress={onPress || (() => {})} className="w-full">
						로그인
					</Button>
					<Button
						size="md"
						variant="secondary"
						onPress={() => router.push('/auth/signup/terms')}
						className="w-full"
						textColor="purple"
					>
						회원가입
					</Button>
				</>
			)}
		</View>
	);
}
