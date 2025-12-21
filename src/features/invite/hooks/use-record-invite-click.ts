import { useMutation } from '@tanstack/react-query';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import { Platform } from 'react-native';
import { recordInviteClick } from '../api';
import type { DeviceType, InviteReferrer, RecordClickRequest } from '../types';
import { MIXPANEL_EVENTS } from '@/src/shared/constants/mixpanel-events';

const getDeviceType = (): DeviceType => {
	if (Platform.OS === 'ios') return 'ios';
	if (Platform.OS === 'android') return 'android';
	return 'web';
};

const generateSessionId = (): string => {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

interface UseRecordInviteClickOptions {
	onSuccess?: () => void;
	onError?: (error: unknown) => void;
}

export function useRecordInviteClick(options?: UseRecordInviteClickOptions) {
	const mutation = useMutation({
		mutationFn: async ({ inviteCode, referrer }: { inviteCode: string; referrer?: InviteReferrer }) => {
			const request: RecordClickRequest = {
				deviceType: getDeviceType(),
				sessionId: generateSessionId(),
				referrer,
			};
			return recordInviteClick(inviteCode, request);
		},
		onSuccess: (data, variables) => {

			mixpanelAdapter.track(MIXPANEL_EVENTS.INVITE_LINK_CLICKED, {
				invite_code: variables.inviteCode,
				referrer: variables.referrer,
				device_type: getDeviceType(),
				click_id: data.clickId,
				timestamp: new Date().toISOString(),
			});

			options?.onSuccess?.();
		},
		onError: (error) => {
			console.error('Failed to record invite click:', error);
			options?.onError?.(error);
		},
	});

	return {
		recordClick: mutation.mutate,
		recordClickAsync: mutation.mutateAsync,
		isLoading: mutation.isPending,
		isError: mutation.isError,
		error: mutation.error,
	};
}
