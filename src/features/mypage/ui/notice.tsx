import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/src/shared/ui';
import CustomSwitch from './custom-switch';

export const Notice = () => {
    const [isMatchComplete, setIsMatchComplete] = useState(false);
    const [isEvent, setIsEvent] = useState(false);

    return (
        <View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>알림 설정</Text>
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 16, color: '#757575' }}>매칭 완료 알림</Text>
                <CustomSwitch value={isMatchComplete} onChange={setIsMatchComplete} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#757575' }}>이벤트 알림</Text>
                <CustomSwitch value={isEvent} onChange={setIsEvent} />  
            </View>
        </View>
    );
}

export default Notice;
