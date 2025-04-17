import React, { useState } from 'react';
import { View, TouchableOpacity, Switch } from 'react-native';
import { Text } from '@/src/shared/ui';


export const Notice = () => {
    const [isMatchComplete, setIsMatchComplete] = useState(false);
    const [isEvent, setIsEvent] = useState(false);

    return (
        <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>알림 설정</Text>
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 16, color: '#757575' }}>매칭 완료 알림</Text>
                <TouchableOpacity>
                    <Switch 
                        value={isMatchComplete} 
                        className='w-[66px] h-[32px] thumb-[#7A4AE2]'
                        onValueChange={() => setIsMatchComplete(!isMatchComplete)} 
                    />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: '#757575' }}>이벤트 알림</Text>
                <TouchableOpacity onPress={() => setIsEvent(!isEvent)}>
                    <Switch
                        value={isEvent}
                        onValueChange={() => setIsEvent(!isEvent)}
                        thumbColor={isEvent ? '#7c3aed' : '#f4f3f4'}
                        trackColor={{ false: '#a0d5d3', true: '#e9d5ff' }}
                        ios_backgroundColor="#ccc"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

