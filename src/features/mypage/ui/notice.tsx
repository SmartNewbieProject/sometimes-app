import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/src/shared/ui';
import CustomSwitch from './custom-switch';

export const Notice = () => {
    const [isMatchComplete, setIsMatchComplete] = useState(false);
    const [isEvent, setIsEvent] = useState(false);

    return (
        <View>
            <Text style={styles.title}>알림 설정</Text>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>매칭 완료 알림</Text>
                <CustomSwitch value={isMatchComplete} onChange={setIsMatchComplete} />
            </View>
            <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>이벤트 알림</Text>
                <CustomSwitch value={isEvent} onChange={setIsEvent} />
            </View>
        </View>
    );
}

export default Notice;

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333333', // text-text-primary
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    settingLabel: {
        fontSize: 16,
        color: '#333333', // text-text-primary
        fontWeight: '500',
    },
});
