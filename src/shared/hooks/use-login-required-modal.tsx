import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { router, usePathname } from 'expo-router';
import { eventBus } from '../libs/event-bus';
import { useModal } from './use-modal';

const AUTH_PATHS = ['/auth', '/onboarding'];
const DEBOUNCE_MS = 1000;

export function useLoginRequiredModal() {
	const { t } = useTranslation();
	const { showModal } = useModal();
	const pathname = usePathname();
	const lastShownRef = useRef<number>(0);

	useEffect(() => {
		const unsubscribe = eventBus.on('auth:loginRequired', () => {
			const now = Date.now();
			if (now - lastShownRef.current < DEBOUNCE_MS) {
				return;
			}
			lastShownRef.current = now;

			const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));
			if (isAuthPage) {
				router.replace('/auth/login');
				return;
			}

			showModal({
				title: t('features.auth.login_required_modal.title'),
				children: t('features.auth.login_required_modal.message'),
				primaryButton: {
					text: t('features.auth.login_required_modal.login_button'),
					onClick: () => {
						router.push('/auth/login');
					},
				},
			});
		});

		return unsubscribe;
	}, [showModal, t, pathname]);
}
