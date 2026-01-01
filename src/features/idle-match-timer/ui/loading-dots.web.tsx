import { View, StyleSheet } from 'react-native';

const DOT_SIZE = 10;
const DOT_GAP = 16;

const dotColors = ['#B8A4D6', '#9B7ED9', '#7A4AE2'];

export const LoadingDots = () => {
	return (
		<View style={styles.container}>
			<style>
				{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.6;
            }
            50% {
              transform: scale(1.3);
              opacity: 1;
            }
          }

          .loading-dot {
            animation: pulse 1.4s ease-in-out infinite;
          }

          .loading-dot-0 {
            animation-delay: 0s;
          }

          .loading-dot-1 {
            animation-delay: 0.2s;
          }

          .loading-dot-2 {
            animation-delay: 0.4s;
          }
        `}
			</style>
			{dotColors.map((color, index) => (
				<div
					key={index}
					className={`loading-dot loading-dot-${index}`}
					style={{
						width: DOT_SIZE,
						height: DOT_SIZE,
						borderRadius: DOT_SIZE / 2,
						backgroundColor: color,
						marginLeft: DOT_GAP / 2,
						marginRight: DOT_GAP / 2,
					}}
				/>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		height: 20,
	},
});
