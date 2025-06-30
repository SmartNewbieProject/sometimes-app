import { Text } from '@/src/shared/ui';
import React, { useState } from 'react';
import { View } from 'react-native';
import CustomSwitch from './custom-switch';

export const Notice = () => {
	const [isMatchComplete, setIsMatchComplete] = useState(false);
	const [isEvent, setIsEvent] = useState(false);

	return (
		<View>
			<Text className="text-[18px] font-medium text-black">알림 설정</Text>
			<View style={{ borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginBottom: 16 }} />
			<View className="flex-row justify-between items-center mb-[16px]">
				<Text className="text-[16px] text-[#4C4854] font-medium">매칭 완료 알림</Text>
				<CustomSwitch value={isMatchComplete} onChange={setIsMatchComplete} />
			</View>
			<View className="flex-row justify-between items-center">
				<Text className="text-[16px] text-[#4C4854] font-medium">이벤트 알림</Text>
				<CustomSwitch value={isEvent} onChange={setIsEvent} />
			</View>
		</View>
	);
};

export default Notice;
