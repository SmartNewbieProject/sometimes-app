import { useAuth } from '@/src/features/auth';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import Loading from '@/src/features/loading';
import MyInfo from '@/src/features/my-info';
import type { Preferences } from '@/src/features/my-info/api';
import { Properties, savePreferences } from '@/src/features/my-info/services';
import { queryClient } from '@/src/shared/config/query';
import { useModal } from '@/src/shared/hooks/use-modal';
import { tryCatch } from '@/src/shared/libs';
import Tooltip from '@/src/shared/ui/tooltip';
import { mixpanelAdapter } from '@/src/shared/libs/mixpanel';
import Layout from '@features/layout';
import { PalePurpleGradient, StepSlider, Text } from '@shared/ui';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';

const { hooks, services, queries } = MyInfo;
const { useMyInfoForm, useMyInfoStep } = hooks;
const { MyInfoSteps } = services;
const { usePreferenceOptionsQuery, PreferenceKeys: Keys } = queries;

export default function TattooSelectionScreen() {
	const { t, i18n } = useTranslation();
	const { updateStep } = useMyInfoStep();
	const { updateForm, clear: _, tattoo, ...form } = useMyInfoForm();
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

	const preferences: Preferences =
		preferencesArray?.find((item) => item.typeCode === Keys.TATTOO) ?? preferencesArray[0];
	const index = preferences?.options.findIndex((item) => item.id === tattoo?.id);

	const currentIndex = index !== undefined && index !== -1 ? index : 0;

	const tooltips =
		preferences?.options.map((_, idx) => {
			const titleKey = `apps.my-info.tattoo.tooltip_${idx}_title`;
			const title = t(titleKey, { defaultValue: t('apps.my-info.tattoo.tooltip_0_title') });

			const descriptions: string[] = [];
			let descIdx = 1;
			while (true) {
				const descKey = `apps.my-info.tattoo.tooltip_${idx}_desc_${descIdx}`;
				const desc = t(descKey, { defaultValue: '' });
				if (!desc) break;
				descriptions.push(desc);
				descIdx++;
			}

			return {
				title,
				description:
					descriptions.length > 0 ? descriptions : [t('apps.my-info.tattoo.tooltip_0_desc_1')],
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
				if (!form.drinking) emptyFields.push(t('apps.my-info.fields.drinking'));
				if (!form.smoking) emptyFields.push(t('apps.my-info.fields.smoking'));
				if (!form.personality || form.personality.length === 0)
					emptyFields.push(t('apps.my-info.fields.personality'));
				if (!form.datingStyleIds || form.datingStyleIds.length === 0)
					emptyFields.push(t('apps.my-info.fields.dating_style'));
				if (!form.interestIds || form.interestIds.length === 0)
					emptyFields.push(t('apps.my-info.fields.interests'));
				if (!form.mbti) emptyFields.push(t('apps.my-info.fields.mbti'));

				if (emptyFields.length > 0) {
					const message = t('apps.my-info.validation.required_fields', {
						fields: emptyFields.join(', '),
					});
					console.error('Validation failed:', { emptyFields, form });
					throw new Error(message);
				}

				await savePreferences({
					drinking: form.drinking?.id as string,
					smoking: form.smoking?.id as string,
					personality: form.personality as string[],
					tattoo: preferences.options[currentIndex].id,
					datingStyleIds: form.datingStyleIds,
					interestIds: form.interestIds,
					mbti: form.mbti as string,
				});
				await queryClient.invalidateQueries({
					queryKey: ['preference-self'],
				});
				mixpanelAdapter.track('Profile_Tattoo', { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
				router.navigate('/my-info/done');
				setFormSubmitLoading(false);
			},
			(serverError: unknown) => {
				const err = serverError as {
					message?: string;
					error?: string;
					status?: number;
					statusCode?: number;
				} | null;
				console.error('Profile save error:', {
					error: serverError,
					errorMessage: err?.message,
					errorString: err?.error,
					status: err?.status,
					statusCode: err?.statusCode,
					form,
				});

				const errorMessage =
					err?.message || err?.error || t('apps.my-info.errors.profile_save_failed');
				showErrorModal(errorMessage, 'error');
				setFormSubmitLoading(false);
			},
		);
	};

	const handleNextButton = () => {
		updateForm('tattoo', preferences.options[currentIndex]);
		mixpanelAdapter.track('Profile_Tattoo', { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
		router.push('/my-info/military');
	};

	useFocusEffect(useCallback(() => updateStep(MyInfoSteps.TATTOO), [updateStep]));

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
						{t('apps.my-info.tattoo.title')}
					</Text>
				</View>
				<View style={styles.bar} />
				<View style={styles.wrapper}>
					<Loading.Lottie title={t('apps.my-info.tattoo.loading')} loading={optionsLoading}>
						<StepSlider
							min={0}
							max={(preferences?.options.length ?? 1) - 1}
							step={1}
							showMiddle={true}
							defaultValue={0}
							value={currentIndex}
							middleLabelLeft={-10}
							onChange={onChangeTattoo}
							options={
								preferences?.options?.map((option) => ({
									label: option.displayName,
									value: option.id,
								})) ?? []
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
				onClickNext={
					my?.gender === 'FEMALE' || i18n.language === 'ja' ? onFinish : handleNextButton
				}
				onClickPrevious={() => router.navigate('/my-info/smoking')}
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
