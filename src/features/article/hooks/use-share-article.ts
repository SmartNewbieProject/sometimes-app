import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';
import { useToast } from '@/src/shared/hooks/use-toast';
import { env } from '@/src/shared/libs/env';
import { shareFeedTemplate } from '@react-native-kakao/share';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Share } from 'react-native';
import { incrementShareCount } from '../apis';
import type { Article, SharePlatform } from '../types';

const KAKAO_JS_KEY = '2356db85eb35f5f941d0d66178e16b4e';

const SCRIPT = {
	src: 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js',
	integrity: 'sha384-WAtVcQYcmTO/N+C1N+1m6Gp8qxh+3NlnP7X1U7qP6P5dQY/MsRBNTh+e1ahJrkEm',
	crossOrigin: 'anonymous',
	async: true,
};

export type ArticleSource = 'auth' | 'community' | 'direct';

interface UseShareArticleProps {
	article: Article | undefined;
	source?: ArticleSource;
}

export const useShareArticle = ({ article, source = 'direct' }: UseShareArticleProps) => {
	const { emitToast } = useToast();
	const { sometimeStoryEvents } = useMixpanel();
	const OS = Platform.OS;
	const [isKakaoReady, setIsKakaoReady] = useState(false);

	const articleUrl = article ? `${env.LINK}/article/${article.slug}` : env.LINK;

	// Mixpanel 공유 이벤트 트래킹
	const trackMixpanelShare = useCallback(
		(platform: 'kakao' | 'link' | 'native') => {
			if (!article) return;
			sometimeStoryEvents.trackArticleShared(
				article.id,
				article.slug,
				article.title,
				platform,
				source,
			);
		},
		[article, source, sometimeStoryEvents],
	);

	const createKakaoTemplate = useCallback(() => {
		if (!article) return null;

		return {
			content: {
				title: article.title,
				description: article.excerpt,
				imageUrl: article.thumbnail.url,
				link: {
					mobileWebUrl: articleUrl,
					webUrl: articleUrl,
				},
			},
			buttons: [
				{
					title: '자세히 보기',
					link: {
						mobileWebUrl: articleUrl,
						webUrl: articleUrl,
					},
				},
				...(Platform.OS !== 'web'
					? [
							{
								title: '앱에서 열기',
								link: {
									androidExecutionParams: {
										path: `/article/${article.slug}`,
									},
									iosExecutionParams: {
										path: `/article/${article.slug}`,
									},
								},
							},
						]
					: []),
			],
		};
	}, [article, articleUrl]);

	// 웹에서 Kakao SDK 로드
	useEffect(() => {
		if (OS !== 'web') return;

		if ((window as any)?.Kakao?.isInitialized?.()) {
			setIsKakaoReady(true);
			return;
		}

		const script = document.createElement('script');
		script.src = SCRIPT.src;
		script.integrity = SCRIPT.integrity;
		script.crossOrigin = SCRIPT.crossOrigin;
		script.async = SCRIPT.async;

		script.onload = () => {
			try {
				const Kakao = (window as any).Kakao;
				if (!Kakao) {
					throw new Error('Kakao SDK not loaded');
				}

				if (!Kakao.isInitialized()) {
					Kakao.init(KAKAO_JS_KEY);
				}
				setIsKakaoReady(true);
			} catch (error) {
				console.error('Kakao SDK init failed:', error);
			}
		};

		script.onerror = (error) => {
			console.error('Kakao SDK load failed:', error);
		};

		document.body.appendChild(script);

		return () => {
			try {
				if (script.parentNode) {
					document.body.removeChild(script);
				}
			} catch (error) {
				console.error('Script 제거 실패:', error);
			}
		};
	}, [OS]);

	// 공유 카운트 기록
	const trackShare = useCallback(
		async (platform: SharePlatform) => {
			if (!article?.id) return;
			try {
				await incrementShareCount(article.id, platform);
			} catch (error) {
				console.error('Share tracking failed:', error);
			}
		},
		[article?.id],
	);

	// 카카오톡 공유
	const shareToKakao = useCallback(async () => {
		if (!article) return;

		const template = createKakaoTemplate();
		if (!template) return;

		if (OS !== 'web') {
			try {
				await shareFeedTemplate({ template });
				trackShare('kakao');
				trackMixpanelShare('kakao');
			} catch (error) {
				console.error('Kakao share failed:', error);
				emitToast('공유에 실패했어요');
			}
			return;
		}

		if (!isKakaoReady) {
			emitToast('잠시 후 다시 시도해주세요');
			return;
		}

		try {
			const Kakao = (window as any).Kakao;
			if (!Kakao) {
				emitToast('카카오 공유를 사용할 수 없어요');
				return;
			}

			Kakao.Share.sendDefault({
				objectType: 'feed',
				...template,
			});
			trackShare('kakao');
			trackMixpanelShare('kakao');
		} catch (error) {
			console.error('Kakao share failed:', error);
			emitToast('공유에 실패했어요');
		}
	}, [article, createKakaoTemplate, OS, isKakaoReady, trackShare, trackMixpanelShare, emitToast]);

	// 링크 복사
	const copyLink = useCallback(async () => {
		if (!article) return;

		try {
			await Clipboard.setStringAsync(articleUrl);
			emitToast('링크가 복사되었어요');
			trackShare('link');
			trackMixpanelShare('link');
		} catch (error) {
			console.error('Copy link failed:', error);
			emitToast('복사에 실패했어요');
		}
	}, [article, articleUrl, trackShare, trackMixpanelShare, emitToast]);

	// 네이티브 공유 (iOS/Android Share Sheet)
	const shareNative = useCallback(async () => {
		if (!article) return;

		try {
			const result = await Share.share({
				title: article.title,
				message: `${article.title}\n\n${articleUrl}`,
				url: articleUrl,
			});

			if (result.action === Share.sharedAction) {
				trackShare('other');
				trackMixpanelShare('native');
			}
		} catch (error) {
			console.error('Native share failed:', error);
		}
	}, [article, articleUrl, trackShare, trackMixpanelShare]);

	return {
		shareToKakao,
		copyLink,
		shareNative,
		isKakaoReady: OS !== 'web' || isKakaoReady,
		articleUrl,
	};
};
