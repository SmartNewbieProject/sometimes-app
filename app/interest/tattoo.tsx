import { useAuth } from '@/src/features/auth';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import type { Preferences } from '@/src/features/interest/api';
import { Properties, savePreferences } from '@/src/features/interest/services';
import Loading from '@/src/features/loading';
import { queryClient } from '@/src/shared/config/query';
import { useModal } from '@/src/shared/hooks/use-modal';
import { tryCatch } from '@/src/shared/libs';
import Tooltip from '@/src/shared/ui/tooltip';
import { Selector } from '@/src/widgets/selector';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import Interest from '@features/interest';
import Layout from '@features/layout';
import { PalePurpleGradient, StepSlider, Text } from '@shared/ui';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const { ui, hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

export default function TattooSelectionScreen() {
	const { updateStep } = useInterestStep();
	const { updateForm, clear: _, tattoo, ...form } = useInterestForm();
	const [formSubmitLoading, setFormSubmitLoading] = useState(false);
	const { my } = useAuth();
	const {
		data: preferencesArray = [
			{
				typeCode: '',
				typeName: '',
				options: [],
			},
		],
		isLoading: optionsLoading,
	} = usePreferenceOptionsQuery();
	const { showErrorModal } = useModal();
	const { t, i18n } = useTranslation();

	const preferences: Preferences =
		preferencesArray?.find((item) => item.typeCode === Keys.TATTOO) ?? preferencesArray[0];
	const index = preferences?.options.findIndex((item) => item.id === tattoo?.id);

	const currentIndex = index !== undefined && index !== -1 ? index : 0;

	const tooltips =
		preferences?.options.map((_, idx) => {
			const titleKey = `apps.interest.tattoo.tooltip_${idx}_title`;
			const title = t(titleKey, { defaultValue: t('apps.interest.tattoo.tooltip_0_title') });

			const descriptions: string[] = [];
			let descIdx = 1;
			while (true) {
				const descKey = `apps.interest.tattoo.tooltip_${idx}_desc_${descIdx}`;
				const desc = t(descKey, { defaultValue: '' });
				if (!desc) break;
				descriptions.push(desc);
				descIdx++;
			}

			return {
				title,
				description:
					descriptions.length > 0 ? descriptions : [t('apps.interest.tattoo.tooltip_0_desc_1')],
			};
		}) ?? [];
	useEffect(() => {
		if (optionsLoading) return;
		if (!tattoo && preferences.options[currentIndex]) {
			updateForm('tattoo', preferences.options[currentIndex]);
		}
	}, [optionsLoading, preferences.options, currentIndex, tattoo]);
	const onChangeTattoo = (value: number) => {
		if (preferences?.options && preferences.options.length > value) {
			updateForm('tattoo', preferences.options[value]);
		}
	};
	const onFinish = async () => {
		setFormSubmitLoading(true);
		updateForm('tattoo', preferences.options[currentIndex]);
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
					tattoo: preferences.options[currentIndex].id,
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
		updateForm('tattoo', preferences.options[currentIndex]);
		router.push('/interest/military');
	};

	useFocusEffect(useCallback(() => updateStep(InterestSteps.TATTOO), [updateStep]));

	if (formSubmitLoading) {
		return <Loading.Page />;
	}

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
						<StepSlider
							min={0}
							max={(preferences?.options.length ?? 1) - 1}
							step={1}
							showMiddle={true}
							defaultValue={1}
							value={currentIndex}
							middleLabelLeft={-15}
							onChange={onChangeTattoo}
							options={
								preferences?.options.map((option, idx) => {
									// 백엔드 key → 번역 key 매핑
									const keyMapping: Record<string, string> = {
										NONE: 'no_tattoo',
										NONE_STRICT: 'no_tattoo',
										SMALL: 'small_tattoo',
										SMALL_TATTOO: 'small_tattoo',
										YES: 'has_tattoo',
										HAS_TATTOO: 'has_tattoo',
										NO_TATTOO: 'no_tattoo',
										EXIST: 'has_tattoo',
										EXISTS: 'has_tattoo',
										OK: 'has_tattoo',
										TATTOO: 'has_tattoo',
										DONT_CARE: 'small_tattoo',
										NO_MATTER: 'small_tattoo',
									};

									// displayName fallback (한국어/일본어)
									const displayMapping: Record<string, string> = {
										'문신 없음': 'no_tattoo',
										'작은 문신': 'small_tattoo',
										'문신 O': 'has_tattoo',
										タトゥーなし: 'no_tattoo',
										小さいタトゥー: 'small_tattoo',
										タトゥーあり: 'has_tattoo',
									};

									// 인덱스 기반 fallback (0: 없음, 1: 작은, 2: 있음)
									const indexFallback = ['no_tattoo', 'small_tattoo', 'has_tattoo'];

									const getLabel = () => {
										// 1. 백엔드 key로 매핑 시도
										if (option.key) {
											const mapped = keyMapping[option.key.toUpperCase()];
											if (mapped) {
												const translated = t(`apps.interest.tattoo.${mapped}`);
												if (!translated.startsWith('apps.')) return translated;
											}
										}

										// 2. displayName으로 매핑 시도
										const displayMapped = displayMapping[option.displayName];
										if (displayMapped) {
											const translated = t(`apps.interest.tattoo.${displayMapped}`);
											if (!translated.startsWith('apps.')) return translated;
										}

										// 3. 인덱스 기반 fallback
										const idxKey = indexFallback[idx] || 'no_tattoo';
										const translated = t(`apps.interest.tattoo.${idxKey}`);
										if (!translated.startsWith('apps.')) return translated;

										// 4. 최종 fallback: displayName 그대로 사용
										return option.displayName;
									};

									return {
										label: getLabel(),
										value: option.id,
									};
								}) ?? []
							}
						/>
					</Loading.Lottie>
				</View>
				<View style={styles.tooltipContainer}>
					<Tooltip
						title={tooltips[currentIndex]?.title ?? ''}
						description={tooltips[currentIndex]?.description ?? []}
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
	ageContainer: {
		flex: 1,
		width: '100%',
		alignItems: 'center',
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
