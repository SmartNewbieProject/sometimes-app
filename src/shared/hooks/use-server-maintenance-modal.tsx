import type { AxiosRequestConfig } from 'axios';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { semanticColors } from '../constants/semantic-colors';
import axiosClient from '../libs/axios';
import { eventBus } from '../libs/event-bus';
import { Text } from '../ui/text';
import { useModal } from './use-modal';

const DEBOUNCE_MS = 3000;

type MaintenancePayload = {
	type: 'temporary' | 'maintenance';
	config: AxiosRequestConfig;
};

export function useServerMaintenanceModal() {
	const { t } = useTranslation();
	const { showModal, hideModal } = useModal();
	const lastShownRef = useRef<number>(0);
	const lastConfigRef = useRef<AxiosRequestConfig | null>(null);
	const showModalRef = useRef(showModal);
	const hideModalRef = useRef(hideModal);
	const tRef = useRef(t);

	showModalRef.current = showModal;
	hideModalRef.current = hideModal;
	tRef.current = t;

	const handleRetry = useCallback(async () => {
		if (!lastConfigRef.current) {
			hideModalRef.current();
			return;
		}

		try {
			await axiosClient(lastConfigRef.current);
			hideModalRef.current();
		} catch {
			// 재시도 실패 시 모달 유지
		}
	}, []);

	useEffect(() => {
		const unsubscribe = eventBus.on('server:maintenance', (payload: MaintenancePayload) => {
			const now = Date.now();
			if (now - lastShownRef.current < DEBOUNCE_MS) return;
			lastShownRef.current = now;
			lastConfigRef.current = payload.config;

			if (payload.type === 'maintenance') {
				showModalRef.current({
					title: tRef.current('shareds.hooks.server_maintenance.maintenance_title'),
					children: (
						<View>
							<Text style={styles.body} weight="medium" textColor="black">
								{tRef.current('shareds.hooks.server_maintenance.maintenance_body')}
							</Text>
							<Text style={styles.contact} weight="medium">
								{tRef.current('shareds.hooks.server_maintenance.contact')}
							</Text>
						</View>
					),
					primaryButton: {
						text: tRef.current('shareds.hooks.server_maintenance.confirm_button'),
						onClick: () => {},
					},
					dismissable: false,
					hideCloseButton: true,
				});
			} else {
				showModalRef.current({
					title: tRef.current('shareds.hooks.server_maintenance.temporary_title'),
					children: (
						<Text style={styles.body} weight="medium" textColor="black">
							{tRef.current('shareds.hooks.server_maintenance.temporary_body')}
						</Text>
					),
					primaryButton: {
						text: tRef.current('shareds.hooks.server_maintenance.retry_button'),
						onClick: handleRetry,
					},
					secondaryButton: {
						text: tRef.current('shareds.hooks.server_maintenance.close_button'),
						onClick: () => {},
					},
					dismissable: false,
					hideCloseButton: true,
				});
			}
		});

		return unsubscribe;
	}, [handleRetry]);
}

const styles = StyleSheet.create({
	body: {
		textAlign: 'center',
		lineHeight: 22,
	},
	contact: {
		textAlign: 'center',
		marginTop: 12,
		fontSize: 12,
		color: semanticColors.text.muted,
	},
});
