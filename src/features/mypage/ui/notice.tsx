import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import CustomSwitch from './custom-switch';
import { useTranslation } from 'react-i18next';

export const Notice = () => {
    const { t } = useTranslation();
    const [isMatchComplete, setIsMatchComplete] = useState(false);
    const [isEvent, setIsEvent] = useState(false);

    return (
        <View>
            <Text style={noticeStyles.title}>{t('features.mypage.notification.title')}</Text>
            <View style={noticeStyles.divider} />
            <View style={noticeStyles.row}>
                <Text style={noticeStyles.label}>{t('features.mypage.notification.matching_complete')}</Text>
                <CustomSwitch value={isMatchComplete} onChange={setIsMatchComplete} />
            </View>
            <View style={noticeStyles.rowLast}>
                <Text style={noticeStyles.label}>{t('features.mypage.notification.event_notification')}</Text>
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
