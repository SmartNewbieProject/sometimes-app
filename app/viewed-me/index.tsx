import { ViewerList } from '@/src/features/profile-viewer/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { BottomNavigation } from '@/src/shared/ui';
import { StyleSheet, View } from 'react-native';

function ViewedMe() {
	return (
		<View style={styles.container}>
			<ViewerList />
			<BottomNavigation />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: semanticColors.surface.background,
		flex: 1,
	},
});

export default ViewedMe;
