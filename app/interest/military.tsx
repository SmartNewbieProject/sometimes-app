import { useAuth } from '@/src/features/auth';
import type { Preferences } from '@/src/features/interest/api';
import { savePreferences } from '@/src/features/interest/services';
import Layout from '@/src/features/layout';
import Loading from '@/src/features/loading';
import { queryClient } from '@/src/shared/config/query';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { usePreferenceTooltips } from '@/src/shared/hooks';
import { useModal } from '@/src/shared/hooks/use-modal';
import { ImageResources, tryCatch } from '@/src/shared/libs';
import { PalePurpleGradient, Text } from '@/src/shared/ui';
import Tooltip from '@/src/shared/ui/tooltip';
import type { PreferenceOption } from '@/src/types/user';
import { ChipSelector } from '@/src/widgets/chip-selector';
import Interest from '@features/interest';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, View } from 'react-native';

const { hooks, services, queries } = Interest;
const { useInterestStep, useInterestForm } = hooks;
const { InterestSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys } = queries;

const NO_PREFERENCE_KEY = 'NO_PREFERENCE';

export default function MilitarySelectionScreen() {
	const { updateForm, clear: _, militaryPreference, ...form } = useInterestForm();
	const [formSubmitLoading, setFormSubmitLoading] = useState(false);
	const { my } = useAuth();
	const { showErrorModal } = useModal();
	const { t } = useTranslation();
	const {
		data: preferencesArray = [{ typeCode: '', typeName: '', options: [] }],
		isLoading: optionsLoading,
	} = usePreferenceOptionsQuery();

	const preferences: Preferences =
		preferencesArray?.find((item) => item.typeCode === PreferenceKeys.MILITARY_PREFERENCE) ??
		preferencesArray[0];

	// "상관없음" 옵션 분리
	const noPreferenceOption = useMemo(
		() => preferences?.options.find((opt) => opt.key === NO_PREFERENCE_KEY),
		[preferences?.options],
	);
	const sliderOptions = useMemo(
		() => preferences?.options.filter((opt) => opt.key !== NO_PREFERENCE_KEY) ?? [],
		[preferences?.options],
	);

	const isNoPreference = militaryPreference?.key === NO_PREFERENCE_KEY;

	// 슬라이더 내 현재 인덱스 (상관없음 선택 시 0으로 폴백)
	const sliderIndex = useMemo(() => {
		if (isNoPreference || !militaryPreference) return 0;
		const idx = sliderOptions.findIndex((opt) => opt.id === militaryPreference.id);
		return idx !== -1 ? idx : 0;
	}, [isNoPreference, militaryPreference, sliderOptions]);

	// 상관없음용 tooltip
	const noPreferenceTooltip = useMemo(() => {
		const allTooltips =
			preferences?.options.map((_, i) => {
				const title = t(`apps.interest.military.tooltip_${i}_title`, { defaultValue: '' });
				const descriptions: string[] = [];
				for (let d = 1; d <= 5; d++) {
					const desc = t(`apps.interest.military.tooltip_${i}_desc_${d}`, { defaultValue: '' });
					if (!desc) break;
					descriptions.push(desc);
				}
				return { title, description: descriptions };
			}) ?? [];
		const noPrefIdx = preferences?.options.findIndex((opt) => opt.key === NO_PREFERENCE_KEY) ?? -1;
		return noPrefIdx >= 0 ? allTooltips[noPrefIdx] : null;
	}, [preferences?.options, t]);

	// 슬라이더 옵션용 tooltip (상관없음 제외, 원본 인덱스 기준으로 매핑)
	const sliderTooltips = useMemo(() => {
		return (
			preferences?.options
				.map((opt, i) => {
					if (opt.key === NO_PREFERENCE_KEY) return null;
					const title = t(`apps.interest.military.tooltip_${i}_title`, { defaultValue: '' });
					const descriptions: string[] = [];
					for (let d = 1; d <= 5; d++) {
						const desc = t(`apps.interest.military.tooltip_${i}_desc_${d}`, { defaultValue: '' });
						if (!desc) break;
						descriptions.push(desc);
					}
					return { title, description: descriptions };
				})
				.filter(Boolean) ?? []
		);
	}, [preferences?.options, t]);

	useEffect(() => {
		if (optionsLoading) return;
		if (!militaryPreference && sliderOptions[0]) {
			updateForm('militaryPreference', sliderOptions[0]);
		}
	}, [optionsLoading, sliderOptions, militaryPreference]);

	useFocusEffect(
		useCallback(() => useInterestStep.getState().updateStep(InterestSteps.MILITARY), []),
	);

	const onFinish = async () => {
		setFormSubmitLoading(true);
		await tryCatch(
			async () => {
				const emptyFields = [];
				if (!form.age)
					emptyFields.push(t('features.interest.validation.field_labels.preferred_age'));
				if (!form.drinking)
					emptyFields.push(t('features.interest.validation.field_labels.drinking'));
				if (!form.smoking) emptyFields.push(t('features.interest.validation.field_labels.smoking'));
				if (!form.tattoo) emptyFields.push(t('features.interest.validation.field_labels.tattoo'));
				if (!form.personality || form.personality.length === 0)
					emptyFields.push(t('features.interest.validation.field_labels.personality'));

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
					tattoo: form.tattoo?.id as string,
					personality: form.personality as string[],
					militaryPreference: militaryPreference?.id ?? '',
					goodMbti: form.goodMbti as string,
					badMbti: form.badMbti as string,
				});
				await queryClient.invalidateQueries({
					queryKey: ['check-preference-fill'],
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

	const onChangeSlider = (id: string) => {
		const opt = sliderOptions.find((o) => o.id === id);
		if (opt) updateForm('militaryPreference', opt);
	};

	const onToggleNoPreference = () => {
		if (isNoPreference) {
			// 상관없음 해제 → 슬라이더 첫 번째 옵션으로
			updateForm('militaryPreference', sliderOptions[0]);
		} else if (noPreferenceOption) {
			updateForm('militaryPreference', noPreferenceOption);
		}
	};

	const currentTooltip = isNoPreference ? noPreferenceTooltip : sliderTooltips[sliderIndex];

	return (
		<Layout.Default>
			<PalePurpleGradient />
			<View style={styles.contentContainer}>
				<Image
					source={{ uri: ImageResources.MILITARY }}
					style={{ width: 81, height: 81, marginLeft: 28 }}
				/>
				<View style={styles.topContainer}>
					<Text weight="semibold" size="20" textColor="black">
						군필에 대해
					</Text>
					<Text weight="semibold" size="20" textColor="black">
						어떻게 생각하시나요?
					</Text>
				</View>

				<View style={styles.bar} />

				<View style={styles.wrapper}>
					<Loading.Lottie
						title={t('features.interest.ui.loading.loading_options')}
						loading={optionsLoading}
					>
						<ChipSelector
							options={sliderOptions.map((option) => ({
								label: option.displayName,
								value: option.id,
							}))}
							value={isNoPreference ? undefined : militaryPreference?.id}
							onChange={onChangeSlider}
							align="center"
						/>

						{noPreferenceOption && (
							<Pressable
								onPress={onToggleNoPreference}
								style={[styles.noPreferenceChip, isNoPreference && styles.noPreferenceChipActive]}
							>
								<Text
									size="14"
									weight={isNoPreference ? 'semibold' : 'regular'}
									style={{
										color: isNoPreference
											? semanticColors.surface.background
											: semanticColors.text.secondary,
									}}
								>
									{noPreferenceOption.displayName}
								</Text>
							</Pressable>
						)}
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
				disabledNext={false}
				onClickNext={onFinish}
				onClickPrevious={() => router.navigate('/interest/tattoo')}
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
		position: 'relative',
	},
	tooltipContainer: {
		position: 'absolute',
		paddingHorizontal: 32,
		bottom: 42,
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
	noPreferenceChip: {
		marginTop: 24,
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: semanticColors.border.default,
		backgroundColor: semanticColors.surface.background,
		alignSelf: 'center',
	},
	noPreferenceChipActive: {
		borderColor: semanticColors.brand.primary,
		backgroundColor: semanticColors.brand.primary,
	},
});
