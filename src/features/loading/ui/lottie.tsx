import { View, StyleSheet } from 'react-native';
import { Text } from '@/src/shared/ui/text';

type Props = {
	title?: string;
	loading: boolean;
	children?: React.ReactNode;
};

const Lottie: React.FC<Props> = ({ title, loading, children, ...props }) => {
	if (loading) {
		return (
			<View style={styles.container}>
				<Text variant="primary" size="sm" textColor="pale-purple">
					{title}
				</Text>
				<View style={styles.hidden}>{children}</View>
			</View>
		);
	}

	return children;
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
	},
	hidden: {
		display: 'none',
	},
});

export default Lottie;
