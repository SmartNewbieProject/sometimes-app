import { useAuth } from '@/src/features/auth';
import type { Preferences } from '@/src/features/interest/api';
import { savePreferences } from '@/src/features/interest/services';
import Loading from '@/src/features/loading';
import { queryClient } from '@/src/shared/config/query';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useModal } from '@/src/shared/hooks/use-modal';
import { tryCatch } from '@/src/shared/libs';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import Tooltip from '@/src/shared/ui/tooltip';
import { ChipSelector } from '@/src/widgets/chip-selector';
import Interest from '@features/interest';
import Layout from '@features/layout';
import { PalePurpleGradient, Text } from '@shared/ui';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

const { hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

// key 기준 슬라이더 순서: 문신X → 작은문신 → 문신O (상관없음은 분리)
const SORT_ORDER: Record<string, number> = {
	NONE: 0,
	NONE_STRICT: 0,
	SMALL: 1,
	SMALL_TATTOO: 1,
	OKAY: 2,
	YES: 2,
	HAS_TATTOO: 2,
	EXIST: 2,
	EXISTS: 2,
};

const NO_PREF_KEYS = new Set(['NO_PREFERENCE', 'DONT_CARE', 'NO_MATTER']);

// key → tooltip 번역키 suffix
const TOOLTIP_KEY_MAP: Record<string, string> = {
	NONE: 'tooltip_none',
	NONE_STRICT: 'tooltip_none',
	SMALL: 'tooltip_small',
	SMALL_TATTOO: 'tooltip_small',
	NO_PREFERENCE: 'tooltip_no_preference',
	DONT_CARE: 'tooltip_no_preference',
	NO_MATTER: 'tooltip_no_preference',
	OKAY: 'tooltip_okay',
	YES: 'tooltip_okay',
	HAS_TATTOO: 'tooltip_okay',
	EXIST: 'tooltip_okay',
	EXISTS: 'tooltip_okay',
};

export default function TattooSelectionScreen() {
	const { updateStep } = useInterestStep();
	const { updateForm, clear: _, tattoo, ...form } = useInterestForm();
	const [formSubmitLoading, setFormSubmitLoading] = useState(false);
	const { my } = useAuth();
	const {
		data: preferencesArray = [{ typeCode: '', typeName: '', options: [] }],
		isLoading: optionsLoading,
	} = usePreferenceOptionsQuery();
	const { showErrorModal } = useModal();
	const { t, i18n } = useTranslation();

	const rawPreferences: Preferences =
		preferencesArray?.find((item) => item.typeCode === Keys.TATTOO) ?? preferencesArray[0];

	// 전체 옵션 정렬 (문신X → 작은문신 → 상관없음 → 문신O)
	const allOptions = useMemo(
		() =>
			[...rawPreferences.options].sort(
				(a, b) => {
					const orderA = NO_PREF_KEYS.has(a.key?.toUpperCase() ?? '') ? 1.5 : (SORT_ORDER[a.key?.toUpperCase() ?? ''] ?? 99);
					const orderB = NO_PREF_KEYS.has(b.key?.toUpperCase() ?? '') ? 1.5 : (SORT_ORDER[b.key?.toUpperCase() ?? ''] ?? 99);
					return orderA - orderB;
				},
			),
		[rawPreferences.options],
	);

	// tooltip 생성 헬퍼
	const buildTooltip = useCallback(
		(opt: { key?: string; displayName: string }) => {
			const suffix = TOOLTIP_KEY_MAP[opt.key?.toUpperCase() ?? ''];
			if (!suffix) return { title: opt.displayName, description: [] as string[] };
			const title = t(`apps.interest.tattoo.${suffix}_title`, { defaultValue: opt.displayName });
			const descriptions: string[] = [];
			for (let i = 1; i <= 5; i++) {
				const desc = t(`apps.interest.tattoo.${suffix}_desc_${i}`, { defaultValue: '' });
				if (!desc) break;
				descriptions.push(desc);
			}
			return { title, description: descriptions };
		},
		[t],
	);

	const tooltips = useMemo(() => allOptions.map(buildTooltip), [allOptions, buildTooltip]);

	const currentIndex = useMemo(() => {
		if (!tattoo) return 0;
		const idx = allOptions.findIndex((opt) => opt.id === tattoo.id);
		return idx !== -1 ? idx : 0;
	}, [tattoo, allOptions]);

	const currentTooltip = tooltips[currentIndex];

	useEffect(() => {
		if (optionsLoading) return;
		if (!tattoo && allOptions[0]) {
			updateForm('tattoo', allOptions[0]);
		}
	}, [optionsLoading, allOptions, tattoo]);

	const onChangeChip = (id: string) => {
		const opt = allOptions.find((o) => o.id === id);
		if (opt) updateForm('tattoo', opt);
	};

	const onFinish = async () => {
		setFormSubmitLoading(true);
		const selectedTattoo = tattoo ?? allOptions[0];
		await tryCatch(
			async () => {
				const emptyFields = [];
				if (!form.age)
					emptyFields.push(t('features.interest.validation.field_labels.preferred_age'));
				if (!form.drinking)
					emptyFields.push(t('features.interest.validation.field_labels.drinking'));
				if (!form.smoking) emptyFields.push(t('features.interest.validation.field_labels.smoking'));
				if (!form.personality || form.personality.length === 0)
					emptyFields.push(t('features.interest.validation.field_labels.personality'));
				if (my?.gender === 'FEMALE' && i18n.language !== 'ja' && !form.militaryPreference)
					emptyFields.push(t('features.interest.validation.field_labels.military'));

				if (emptyFields.length > 0) {
					const message = t('features.interest.validation.required_fields', {
						fields: emptyFields.join(', '),
					});
					console.error('Validation failed:', { emptyFields, form });
					throw new Error(message);
				}

				await savePreferences({
					age: form.age as string,
					drinking: form.drinking?.id as string,
					smoking: form.smoking?.id as string,
					personality: form.personality as string[],
					tattoo: selectedTattoo.id,
					militaryPreference: form.militaryPreference?.id ?? '',
					goodMbti: form.goodMbti as string,
					badMbti: form.badMbti as string,
				});
				await queryClient.invalidateQueries({
					queryKey: ['check-preference-fill'],
				});
				mixpanelAdapter.track('Interest_Tattoo', {
					env: process.env.EXPO_PUBLIC_TRACKING_MODE,
				});
				router.navigate('/interest/done');
				setFormSubmitLoading(false);
			},
			(serverError: unknown) => {
				const err = serverError as {
					message?: string;
					error?: string;
					status?: number;
					statusCode?: number;
				} | null;
				console.error('Preference save error:', {
					error: serverError,
					errorMessage: err?.message,
					errorString: err?.error,
					status: err?.status,
					statusCode: err?.statusCode,
					form,
				});

				const errorMessage =
					err?.message || err?.error || t('features.interest.errors.save_failed');
				showErrorModal(errorMessage, 'error');
				setFormSubmitLoading(false);
			},
		);
	};

	const handleNextButton = () => {
		mixpanelAdapter.track('Interest_Tattoo', { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
		router.push('/interest/military');
	};

	useFocusEffect(useCallback(() => updateStep(InterestSteps.TATTOO), [updateStep]));

	if (formSubmitLoading) {
		return <Loading.Page />;
	}

	// 칩 라벨 생성
	const getChipLabel = (option: { key?: string; displayName: string }, idx: number) => {
		const keyMapping: Record<string, string> = {
			NONE: 'dont_care',
			NONE_STRICT: 'no_tattoo',
			DONT_CARE: 'dont_care',
			NO_MATTER: 'dont_care',
			NO_PREFERENCE: 'dont_care',
			SMALL: 'small_tattoo',
			SMALL_TATTOO: 'small_tattoo',
			YES: 'has_tattoo',
			HAS_TATTOO: 'has_tattoo',
			NO_TATTOO: 'no_tattoo',
			EXIST: 'has_tattoo',
			EXISTS: 'has_tattoo',
			OK: 'has_tattoo',
			OKAY: 'has_tattoo',
			TATTOO: 'has_tattoo',
		};
		const displayMapping: Record<string, string> = {
			'문신 없음': 'no_tattoo',
			'작은 문신': 'small_tattoo',
			'문신 O': 'has_tattoo',
			タトゥーなし: 'no_tattoo',
			小さいタトゥー: 'small_tattoo',
			タトゥーあり: 'has_tattoo',
		};
		const indexFallback = ['no_tattoo', 'small_tattoo', 'has_tattoo'];

		if (option.key) {
			const mapped = keyMapping[option.key.toUpperCase()];
			if (mapped) {
				const translated = t(`apps.interest.tattoo.${mapped}`);
				if (!translated.startsWith('apps.')) return translated;
			}
		}
		const displayMapped = displayMapping[option.displayName];
		if (displayMapped) {
			const translated = t(`apps.interest.tattoo.${displayMapped}`);
			if (!translated.startsWith('apps.')) return translated;
		}
		const idxKey = indexFallback[idx] || 'no_tattoo';
		const translated = t(`apps.interest.tattoo.${idxKey}`);
		if (!translated.startsWith('apps.')) return translated;
		return option.displayName;
	};

	return (
		<Layout.Default>
			<PalePurpleGradient />
			<View style={styles.contentContainer}>
				<Image
					source={require('@assets/images/loved.png')}
					style={{ width: 81, height: 81, marginLeft: 28 }}
				/>
				<View style={styles.topContainer}>
					<Text weight="semibold" size="20" textColor="black">
						{t('apps.interest.tattoo.title_1')}
					</Text>
					<Text weight="semibold" size="20" textColor="black">
						{t('apps.interest.tattoo.title_2')}
					</Text>
				</View>
				<View style={styles.bar} />
				<View style={styles.wrapper}>
					<Loading.Lottie title={t('apps.interest.tattoo.loading')} loading={optionsLoading}>
						<ChipSelector
							options={allOptions.map((option, idx) => ({
								label: getChipLabel(option, idx),
								value: option.id,
							}))}
							value={tattoo?.id}
							onChange={onChangeChip}
							align="center"
						/>
					</Loading.Lottie>
				</View>
				<View style={styles.tooltipContainer}>
					<Tooltip
						title={currentTooltip?.title ?? ''}
						description={currentTooltip?.description ?? []}
					/>
				</View>
			</View>
			<Layout.TwoButtons
				style={{ paddingHorizontal: 32 }}
				disabledNext={false}
				onClickNext={my?.gender === 'MALE' || i18n.language === 'ja' ? onFinish : handleNextButton}
				onClickPrevious={() => router.navigate('/interest/smoking')}
			/>
		</Layout.Default>
	);
}

const styles = StyleSheet.create({
	topContainer: {
		marginHorizontal: 32,
		marginTop: 15,
	},
	contentContainer: {
		flex: 1,
	},
	bar: {
		marginHorizontal: 32,
		height: 0.5,
		backgroundColor: semanticColors.surface.background,
		marginTop: 39,
		marginBottom: 30,
	},
	wrapper: {
		flex: 1,
		width: '100%',
		alignItems: 'center',
		paddingTop: 32,
		paddingHorizontal: 32,
	},
	tooltipContainer: {
		position: 'absolute',
		paddingHorizontal: 32,
		bottom: 42,
	},
});
