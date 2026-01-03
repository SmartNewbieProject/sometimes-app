import { StyleSheet, View, Platform } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

interface BlurOrbProps {
	cx: number;
	cy: number;
	opacity?: number;
	rx?: number;
	ry?: number;
}

const BlurOrbNative = ({ cx, cy, opacity = 0.4, rx = 120, ry = 82 }: BlurOrbProps) => {
	return (
		<Svg style={StyleSheet.absoluteFill}>
			<Defs>
				<RadialGradient id={`grad-${cx}-${cy}`} cx="50%" cy="50%" rx="50%" ry="50%">
					<Stop offset="0%" stopColor="#7A4AE2" stopOpacity={opacity} />
					<Stop offset="70%" stopColor="#7A4AE2" stopOpacity={opacity * 0.3} />
					<Stop offset="100%" stopColor="#7A4AE2" stopOpacity={0} />
				</RadialGradient>
			</Defs>
			<Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#grad-${cx}-${cy})`} />
		</Svg>
	);
};

const BlurOrbWeb = ({ cx, cy, opacity = 0.4, rx = 120, ry = 82 }: BlurOrbProps) => {
	return (
		<View
			style={[
				styles.orbWeb,
				{
					top: cy - ry,
					left: cx - rx,
					width: rx * 2,
					height: ry * 2,
					borderRadius: rx,
					backgroundColor: `rgba(122, 74, 226, ${opacity})`,
					...(Platform.OS === 'web' ? ({ filter: 'blur(94px)' } as any) : {}),
				},
			]}
		/>
	);
};

export const BlurBackground = () => {
	const isWeb = Platform.OS === 'web';

	if (isWeb) {
		return (
			<View style={styles.container}>
				<BlurOrbWeb cx={90} cy={45} opacity={0.4} rx={120} ry={82} />
				<BlurOrbWeb cx={300} cy={320} opacity={0.3} rx={120} ry={82} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#FEFCFF', '#FAF8FF', '#F7F5FF']}
				locations={[0, 0.6, 1]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
			<BlurOrbNative cx={80} cy={30} opacity={0.25} rx={120} ry={80} />
			<BlurOrbNative cx={280} cy={320} opacity={0.2} rx={120} ry={80} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: '#FEFCFF',
		overflow: 'hidden',
	},
	orbWeb: {
		position: 'absolute',
	},
});
