import { initializeFacebookSDK } from '@/src/shared/lib/facebook-events';
import { GA_TRACKING_ID, sendPageView } from '@/src/shared/utils';
import { usePathname } from 'expo-router';
import type React from 'react';
import { useEffect } from 'react';
import { InteractionManager, Platform } from 'react-native';

interface AnalyticsProviderProps {
	children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
	const pathname = usePathname();

	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		let interactionHandle: ReturnType<typeof InteractionManager.runAfterInteractions> | null = null;

		if (Platform.OS === 'web') {
			const loadGoogleAnalytics = () => {
				if (
					document.querySelector(
						`script[src="https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}"]`,
					)
				) {
					return;
				}

				const script1 = document.createElement('script');
				script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
				script1.async = true;
				document.head.appendChild(script1);

				const script2 = document.createElement('script');
				script2.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}');
        `;
				document.head.appendChild(script2);
			};

			if ('requestIdleCallback' in window) {
				(
					window as typeof window & {
						requestIdleCallback: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number;
					}
				).requestIdleCallback(loadGoogleAnalytics, { timeout: 3000 });
			} else {
				timeoutId = setTimeout(loadGoogleAnalytics, 2000);
			}
		}

		if (Platform.OS !== 'web') {
			timeoutId = setTimeout(() => {
				interactionHandle = InteractionManager.runAfterInteractions(() => {
					initializeFacebookSDK();
				});
			}, 1800);
		}

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			interactionHandle?.cancel();
		};
	}, []);

	useEffect(() => {
		if (Platform.OS === 'web') {
			sendPageView(pathname);
		}
	}, [pathname]);

	return <>{children}</>;
}

declare global {
	interface Window {
		gtag: (
			command: 'config' | 'event' | 'js' | 'set',
			targetId: string,
			config?: Record<string, unknown>,
		) => void;
		dataLayer: unknown[];
	}
}
