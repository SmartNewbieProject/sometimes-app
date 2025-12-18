import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import CustomSwitch from './custom-switch';

export const Notice = () => {
    const [isMatchComplete, setIsMatchComplete] = useState(false);
    const [isEvent, setIsEvent] = useState(false);

    return (
        <View>
            <Text style={noticeStyles.title}>알림 설정</Text>
            <View style={noticeStyles.divider} />
            <View style={noticeStyles.row}>
                <Text style={noticeStyles.label}>매칭 완료 알림</Text>
                <CustomSwitch value={isMatchComplete} onChange={setIsMatchComplete} />
            </View>
            <View style={noticeStyles.rowLast}>
                <Text style={noticeStyles.label}>이벤트 알림</Text>
                <CustomSwitch value={isEvent} onChange={setIsEvent} />
            </View>
        </View>
    );
}

const noticeStyles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: '500',
        color: semanticColors.text.primary,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    rowLast: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        color: semanticColors.text.primary,
        fontWeight: '500',
    },
});

export default Notice;
