import { ImageResources } from '@/src/shared/libs';
import { ImageResource, Text } from '@/src/shared/ui';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

export const GlobalPendingApproval = () => {
	const { t } = useTranslation();

	return (
		<View style={styles.container}>
			<ImageResource
				resource={ImageResources.BROKEN_SANDTIMER}
				width={200}
				height={200}
				style={styles.image}
			/>
			<Text textColor="black" size="20" weight="bold">
				{t('features.global-matching.pending_approval_title')}
			</Text>
			<View style={styles.descriptionContainer}>
				<Text textColor="disabled" size="14">
					{t('features.global-matching.pending_approval_description')}
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 20,
		paddingVertical: 40,
	},
	image: {
		marginBottom: 16,
	},
	descriptionContainer: {
		marginTop: 8,
		alignItems: 'center',
		paddingHorizontal: 32,
	},
});
