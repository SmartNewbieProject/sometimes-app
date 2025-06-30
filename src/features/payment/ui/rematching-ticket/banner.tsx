import { ImageResources } from '@/src/shared/libs/image';
import { ImageResource } from '@/src/shared/ui';
import { Platform, View } from 'react-native';

export const Banner = () => {
	const height = (() => {
		if (Platform.OS === 'web') return 128;
		return 240;
	})();

	return (
		<View>
			<ImageResource
				resource={ImageResources.REMATCHING_TICKET_BANNER}
				style={{ width: '100%', height }}
			/>
		</View>
	);
};
