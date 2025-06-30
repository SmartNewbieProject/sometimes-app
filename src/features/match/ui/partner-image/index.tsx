import { ImageResources } from '@/src/shared/libs';
import type { SimpleProfile } from '@/src/types/user';
import { ImageResource, Text, UniversityBadge } from '@shared/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

type PartnerImageProps = {
	uri: string;
	profile: SimpleProfile;
};

export const PartnerImage = ({ uri, profile }: PartnerImageProps) => {
	return (
		<View style={styles.outerContainer}>
			<LinearGradient
				colors={['#F3EDFF', '#9747FF']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.gradientBorder}
			>
				<View style={styles.container}>
					<Image source={{ uri }} style={styles.image} contentFit="cover" />

					{/* Shadow gradient inside the container to avoid covering the border */}
					<LinearGradient
						colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.7)']}
						style={styles.shadowGradient}
					/>
				</View>
			</LinearGradient>

			<View style={styles.textContainer}>
				<Text textColor="white" weight="semibold" className="text-[20px]">
					만 {profile.age}세
				</Text>
				<View className="flex flex-row items-center">
					<Text textColor="white" weight="light" size="sm">
						#{profile.mbti}
						&nbsp;#{profile.universityName}
					</Text>
					{/* &nbsp;<UniversityBadge authenticated={profile.authenticated} /> */}
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	outerContainer: {
		width: 255,
		height: 255,
		position: 'relative',
	},
	gradientBorder: {
		borderRadius: 20,
		padding: 5,
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	container: {
		borderRadius: 15,
		overflow: 'hidden',
		width: '100%',
		height: '100%',
		position: 'relative',
	},
	image: {
		width: '100%',
		height: '100%',
	},
	shadowGradient: {
		position: 'absolute',
		bottom: 0,
		width: '100%',
		left: 0,
		right: 0,
		height: '40%',
		zIndex: 1,
	},
	textContainer: {
		position: 'absolute',
		display: 'flex',
		flexDirection: 'column',
		left: 14,
		bottom: 28,
		zIndex: 10,
	},
	paperPlane: {
		position: 'absolute',
		right: -42,
		bottom: 16,
	},
	heart: {
		position: 'absolute',
		left: -44,
		top: 16,
		zIndex: -1,
	},
});
