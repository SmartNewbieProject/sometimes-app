import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomSwitchProps {
	value: boolean;
	onChange: (value: boolean) => void;
}

const CustomSwitch = ({ value, onChange }: CustomSwitchProps) => {
	const [isOn, setIsOn] = useState(value);

	const toggleSwitch = () => {
		setIsOn(!isOn);
		onChange(!isOn);
	};

	return (
		<TouchableOpacity onPress={toggleSwitch} style={styles.switchContainer}>
			<View style={[styles.switch, isOn ? styles.switchOn : styles.switchOff]}>
				<View
					style={[styles.switchButton, isOn ? styles.switchButtonOn : styles.switchButtonOff]}
				/>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	switchContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	switch: {
		width: 60,
		height: 30,
		borderRadius: 20,
		padding: 3,

		flexDirection: 'row',
		shadowColor: '#00000040',
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.25,
		shadowRadius: 10,
	},
	switchOn: {
		backgroundColor: '#F3EDFF',
	},
	switchOff: {
		backgroundColor: '#F3EDFF',
	},
	switchButton: {
		shadowColor: '#00000040',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 2,
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: '#7A4AE2',
		position: 'absolute',
		top: 3,
		left: 3,
		transition: 'all 0.3s ease', // 부드러운 애니메이션
	},
	switchButtonOn: {
		left: 33, // 스위치 오른쪽으로 이동
	},
	switchButtonOff: {
		left: 3, // 스위치 왼쪽으로 이동
	},
});

export default CustomSwitch;
