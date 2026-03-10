import { Text } from '@/src/shared/ui/text';
import { StyleSheet, View } from 'react-native';

type Props = {
	title?: string;
	loading: boolean;
	children?: React.ReactNode;
};

const Lottie: React.FC<Props> = ({ title, loading, children, ...props }) => {
	return (
		<View style={styles.wrapper}>
			{loading && (
				<View style={styles.container}>
					<Text variant="primary" size="sm" textColor="pale-purple">
						{title}
					</Text>
				</View>
			)}
			<View style={loading ? styles.hidden : styles.visible}>{children}</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		width: '100%',
	},
	container: {
		flex: 1,
		width: '100%',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
	},
	hidden: {
		display: 'none',
	},
	visible: {
		flex: 1,
		width: '100%',
	},
});

export default Lottie;
