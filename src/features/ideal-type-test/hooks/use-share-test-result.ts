import { SHARE_TEMPLATE_JA, SHARE_TEMPLATE_KO } from '@/src/features/ideal-type-test/constants';
import { useTestAnalytics } from '@/src/features/ideal-type-test/hooks/use-test-analytics';
import { useToast } from '@/src/shared/hooks/use-toast';
import { env } from '@/src/shared/libs/env';
import * as Clipboard from 'expo-clipboard';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Share } from 'react-native';

interface UseShareTestResultProps {
	resultName: string;
	resultEmoji: string;
	resultId: string;
	sessionId?: string | null;
}

export const useShareTestResult = ({
	resultName,
	resultEmoji,
	resultId,
	sessionId,
}: UseShareTestResultProps) => {
	const { t, i18n } = useTranslation();
	const { emitToast } = useToast();
	const { trackShared } = useTestAnalytics();

	const currentLang = i18n.language?.startsWith('ja') ? 'ja' : 'ko';
	const template = currentLang === 'ja' ? SHARE_TEMPLATE_JA : SHARE_TEMPLATE_KO;

	const shareUrl = `${env.LINK}/ideal-type-test`;

	const shareNative = useCallback(async () => {
		try {
			const title = template.title(resultName);
			const message = `${resultEmoji} ${title}\n\n${template.description}\n\n${shareUrl}`;

			const result = await Share.share({
				title,
				message,
				url: shareUrl,
			});

			if (result.action === Share.sharedAction) {
				trackShared({
					share_platform: 'native',
					result_type: resultId,
					source: 'mobile',
				});
			}
		} catch (error) {
			console.error('Native share failed:', error);
		}
	}, [resultName, resultEmoji, resultId, template, shareUrl, trackShared]);

	const copyLink = useCallback(async () => {
		try {
			await Clipboard.setStringAsync(shareUrl);
			emitToast(t('features.ideal-type-test.result.link_copied'));
			trackShared({
				share_platform: 'link',
				result_type: resultId,
				source: 'mobile',
			});
		} catch (error) {
			console.error('Copy link failed:', error);
		}
	}, [shareUrl, emitToast, t, trackShared, resultId]);

	return {
		shareNative,
		copyLink,
	};
};
