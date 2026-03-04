import { ConfigContext } from 'expo/config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default ({ config }: ConfigContext): any => {
	// 환경 변수 로드 (우선순위: 프로세스 환경 변수 > .env 파일)
	const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
	const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL || apiUrl.replace('/api', '');
	const channelKey = process.env.EXPO_PUBLIC_CHANNEL_KEY || '';
	const imp = process.env.EXPO_PUBLIC_IMP || '';
	const kakaoLoginApiKey = process.env.EXPO_PUBLIC_KAKAO_LOGIN_API_KEY || '';
	const kakaoRedirectUri = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI || '';
	const link = process.env.EXPO_PUBLIC_LINK || '';
	const merchantId = process.env.EXPO_PUBLIC_MERCHANT_ID || '';
	const mixpanelToken = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || '';
	const passChannelKey = process.env.EXPO_PUBLIC_PASS_CHANNEL_KEY || '';
	const pgProvider = process.env.EXPO_PUBLIC_PG_PROVIDER || '';
	const slackLogger = process.env.EXPO_PUBLIC_SLACK_LOGGER || '';
	const storeId = process.env.EXPO_PUBLIC_STORE_ID || '';
	const trackingMode = process.env.EXPO_PUBLIC_TRACKING_MODE || 'production';

	// 디버깅: 빌드 시 환경 변수 확인
	console.log('=================================');
	console.log('[app.config.ts] Environment Variables:');
	console.log('  API_URL:', apiUrl || '❌ NOT SET');
	console.log('  SERVER_URL:', serverUrl || '❌ NOT SET');
	console.log('  MERCHANT_ID:', merchantId || '❌ NOT SET');
	console.log('  CHANNEL_KEY:', channelKey ? 'SET ✅' : '❌ NOT SET');
	console.log('  PASS_CHANNEL_KEY:', passChannelKey ? 'SET ✅' : '❌ NOT SET');
	console.log('  STORE_ID:', storeId ? 'SET ✅' : '❌ NOT SET');
	console.log('  IMP:', imp || '❌ NOT SET');
	console.log('  PG_PROVIDER:', pgProvider || '❌ NOT SET');
	console.log('  KAKAO_KEY:', kakaoLoginApiKey || '❌ NOT SET');
	console.log('  KAKAO_REDIRECT:', kakaoRedirectUri || '❌ NOT SET');
	console.log('  LINK:', link || '❌ NOT SET');
	console.log('  MIXPANEL:', mixpanelToken ? 'SET ✅' : '❌ NOT SET');
	console.log('  TRACKING_MODE:', trackingMode);
	console.log('=================================');

	return {
		...config,
		expo: {
			name: 'sometimes',
			slug: 'sometimes',
			version: '4.2.0',
			runtimeVersion: '4.2.0',
			orientation: 'portrait',
			icon: './assets/icons/app.png',
			scheme: 'myapp',
			userInterfaceStyle: 'automatic',
			newArchEnabled: true,
			splash: {
				resizeMode: 'cover',
				image: './assets/images/splash-portrait.png',
				backgroundColor: '#FFFFFF',
				enableFullScreenImage_legacy: true,
			},
			ios: {
				supportsTablet: true,
				bundleIdentifier: 'com.some-in-univ',
				buildNumber: '345',
				entitlements: {
					'com.apple.developer.applesignin': ['Default'],
				},
				googleServicesFile: './GoogleService-Info.plist',
				infoPlist: {
					CFBundleAllowMixedLocalizations: true,
					UIBackgroundModes: ['remote-notification'],
					LSApplicationQueriesSchemes: [
						'kftc-bankpay',
						'ispmobile',
						'hdcardappcardansimclick',
						'smhyundaiansimclick',
						'hyundaicardappcardid',
						'shinhan-sr-ansimclick',
						'shinhan-sr-ansimclick-naverpay',
						'shinhan-sr-ansimclick-payco',
						'shinhan-sr-ansimclick-lpay',
						'shinhan-sr-ansimclick-mola',
						'smshinhanansimclick',
						'smailapp',
						'kb-acp',
						'kb-auth',
						'kb-screen',
						'kbbank',
						'liivbank',
						'newliiv',
						'mpocket.online.ansimclick',
						'ansimclickscard',
						'ansimclickipcollect',
						'vguardstart',
						'samsungpay',
						'scardcertiapp',
						'monimopay',
						'monimopayauth',
						'lottesmartpay',
						'lotteappcard',
						'lmslpay',
						'lpayapp',
						'cloudpay',
						'hanawalletmembers',
						'nhappcardansimclick',
						'nonghyupcardansimclick',
						'nhallonepayansimclick',
						'citispay',
						'citicardappkr',
						'citimobileapp',
						'kakaotalk',
						'payco',
						'com.wooricard.wcard',
						'newsmartpib',
						'NewSmartPib',
						'supertoss',
						'naversearchthirdlogin',
						'kakaobank',
						'v3mobileplusweb',
						'line',
						'alipays',
						'weixin',
						'tauthlink',
						'ktauthexternalcall',
						'upluscorporation',
						'naversearchapp',
						'naverapp',
						'instagram',
						'fb',
						'storylink',
						'paypal',
						'spay',
					],
					NSCameraUsageDescription: '프로필 사진 촬영을 위해 카메라 접근이 필요합니다',
					NSPhotoLibraryUsageDescription:
						'프로필 사진 선택을 위해 사진 라이브러리 접근이 필요합니다',
					NSUserNotificationUsageDescription:
						'매칭 결과 및 중요한 알림을 받기 위해 알림 권한이 필요합니다',
					ITSAppUsesNonExemptEncryption: false,
					'com.apple.developer.associated-domains': [
						'applinks:yourdomain.com',
						'applinks:*.yourdomain.com',
					],
					'com.apple.security.application-groups': ['group.com.some-in-univ.shared'],
					UNUserNotificationCenter: true,
					NSFileProtectionComplete: true,
					NSLocationWhenInUseUsageDescription: '위치 정보를 사용하여 지도 서비스를 제공합니다.',
					NSLocationAlwaysUsageDescription: '백그라운드에서 위치 기반 서비스를 제공합니다.',
					'aps-environment': 'development',
					NSAppTransportSecurity: {
						NSAllowsArbitraryLoads: false,
						NSExceptionDomains: {
							'192.168.219.49': {
								NSExceptionAllowsInsecureHTTPLoads: true,
								NSExceptionRequiresForwardSecrecy: false,
								NSIncludesSubdomains: true,
							},
							'192.168.219.50': {
								NSExceptionAllowsInsecureHTTPLoads: true,
								NSExceptionRequiresForwardSecrecy: false,
								NSIncludesSubdomains: true,
							},
							localhost: {
								NSExceptionAllowsInsecureHTTPLoads: true,
								NSExceptionRequiresForwardSecrecy: false,
							},
						},
					},
				},
			},
			android: {
				versionCode: 341,
				adaptiveIcon: {
					foregroundImage: './assets/images/android-adaptive-icon.png',
					backgroundColor: '#8B7BFF',
				},
				softwareKeyboardLayoutMode: 'pan',
				package: 'com.smartnewb.sometimes',
				googleServicesFile: './google-services.json',
				permissions: [
					'android.permission.CAMERA',
					'android.permission.READ_EXTERNAL_STORAGE',
					'android.permission.WRITE_EXTERNAL_STORAGE',
					'android.permission.INTERNET',
					'android.permission.ACCESS_NETWORK_STATE',
					'android.permission.RECEIVE_BOOT_COMPLETED',
					'android.permission.VIBRATE',
					'android.permission.WAKE_LOCK',
				],
			},
			web: {
				bundler: 'metro',
				output: 'single',
				favicon: './assets/images/favicon-logo.png',
				name: '썸타임 - 대학생 소개팅 앱',
				shortName: '썸타임',
				description: '대학생을 위한 AI 소개팅 매칭 앱',
			},
			plugins: [
				'./plugins/with-ksp-version.js',
				[
					'expo-router',
					{
						origin: 'https://some-in-univ.com',
						asyncRoutes: false,
					},
				],
				[
					'expo-splash-screen',
					{
						backgroundColor: '#FFFFFF',
						image: './assets/images/splash-portrait.png',
						dark: {
							image: './assets/images/splash-portrait.png',
							backgroundColor: '#FFFFFF',
						},
						imageWidth: 400,
						ios: {
							enableFullScreenImage_legacy: true,
						},
					},
				],
				'@react-native-firebase/app',
				'@react-native-firebase/messaging',
				[
					'@react-native-kakao/core',
					{
						nativeAppKey: '4d405583bea731b1c4fb26eb8a14e894',
						android: {
							authCodeHandlerActivity: true,
							forwardKakaoLinkIntentFilterToMainActivity: true,
						},
						ios: {
							handleKakaoOpenUrl: true,
						},
					},
				],
				[
					'expo-build-properties',
					{
						ios: {
							deploymentTarget: '16.0',
							useFrameworks: 'static',
							ccacheEnabled: true,
							forceStaticLinking: ['RNFBApp', 'RNFBMessaging'],
							buildSettings: {
								CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES: 'YES',
							},
						},
						android: {
							extraMavenRepos: ['https://devrepo.kakao.com/nexus/content/groups/public/'],
							kotlinVersion: '2.0.21',
						},
					},
				],
				'@portone/react-native-sdk/plugin',
				[
					'react-native-fbsdk-next',
					{
						appID: '638240219304867',
						clientToken: '451c9dd6de265d20d05657eca3fbba9d',
						displayName: 'SOMETIME',
						scheme: 'fb638240219304867',
						advertiserIDCollectionEnabled: true,
						autoLogAppEventsEnabled: true,
						isAutoInitEnabled: true,
						iosUserTrackingPermission:
							'This identifier will be used to deliver personalized ads to you.',
					},
				],
				[
					'expo-camera',
					{
						cameraPermission: '프로필 사진 촬영을 위해 카메라 권한이 필요합니다.',
					},
				],
				[
					'expo-calendar',
					{
						calendarPermission: '데이트 일정 관리를 위해 캘린더 접근 권한이 필요합니다.',
					},
				],
				[
					'expo-tracking-transparency',
					{
						userTrackingPermission: '썸타임은 사용자에게 맞춤 광고를 위해 추적 권한을 요청합니다.',
					},
				],
				[
					'expo-notifications',
					{
						icon: './assets/icons/app.png',
						color: '#ffffff',
					},
				],
				'expo-web-browser',
				[
					'expo-localization',
					{
						supportedLocales: {
							ios: ['ko', 'ja'],
							android: ['ko', 'ja'],
						},
					},
				],
				'expo-iap',
				'expo-asset',
				'./plugins/withIOS16DeploymentTarget.js',
				'@sentry/react-native',
				[
					'@sentry/react-native/expo',
					{
						url: 'https://sentry.io/',
						project: 'react-native',
						organization: 'smartnewbie',
					},
				],
			],
			locales: {
				ko: './languages/ko.json',
				ja: './languages/ja.json',
			},
			updates: {
				url: 'https://u.expo.dev/f6df6d86-2504-4574-8bf2-e069c6e76316',
				enabled: true,
				fallbackToCacheTimeout: 0,
				checkAutomatically: 'ON_LOAD',
			},
			experiments: {
				typedRoutes: true,
			},
			extra: {
				router: {},
				eas: {
					projectId: 'f6df6d86-2504-4574-8bf2-e069c6e76316',
				},
				enableRemoteLogging: true,
				// 🔥 환경 변수를 extra에 주입 (expo-constants로 접근 가능)
				apiUrl: apiUrl,
				serverUrl: serverUrl,
				channelKey: channelKey,
				imp: imp,
				kakaoLoginApiKey: kakaoLoginApiKey,
				kakaoRedirectUri: kakaoRedirectUri,
				link: link,
				merchantId: merchantId,
				mixpanelToken: mixpanelToken,
				passChannelKey: passChannelKey,
				pgProvider: pgProvider,
				slackLogger: slackLogger,
				storeId: storeId,
				trackingMode: trackingMode,
			},
		},
	};
};
