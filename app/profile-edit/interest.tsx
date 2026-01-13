import { useAuth } from '@/src/features/auth';
import { usePreferenceSelfQuery } from '@/src/features/home/queries';
import Interest from '@/src/features/interest';
import { PreferenceKeys, findPreferenceByType } from '@/src/features/interest/queries';
import { savePreferences } from '@/src/features/interest/services';
import InterestAge from '@/src/features/profile-edit/ui/interest/interest-age';
import InterestBadMbti from '@/src/features/profile-edit/ui/interest/interest-bad-mbti';
import InterestDrinking from '@/src/features/profile-edit/ui/interest/interest-drinking';
import InterestGoodMbti from '@/src/features/profile-edit/ui/interest/interest-good-mbti';
import InterestMilitary from '@/src/features/profile-edit/ui/interest/interest-military';
import InterestPersonality from '@/src/features/profile-edit/ui/interest/interest-personality';
import InterestSmoking from '@/src/features/profile-edit/ui/interest/interest-smoking';
import InterestTattoo from '@/src/features/profile-edit/ui/interest/interest-tattoo';

import { queryClient } from '@/src/shared/config/query';
import { useModal } from '@/src/shared/hooks/use-modal';
import { useGlobalLoading } from '@/src/shared/hooks/use-global-loading';
import { tryCatch } from '@/src/shared/libs';
import { Button } from '@/src/shared/ui';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { hooks } = Interest;
const { useInterestForm } = hooks;

function InterestSection() {
	const { t, i18n } = useTranslation();
	const { updateForm, clear: _, ...form } = useInterestForm();
	const setInitialSnapshot = useInterestForm((state) => state.setInitialSnapshot);
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const { profileDetails } = useAuth();
	const [formSubmitLoading, setFormSubmitLoading] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const { showErrorModal, showModal } = useModal();
	const { showLoading, hideLoading } = useGlobalLoading();

	const hasChanges = useInterestForm((state) => {
		const { initialSnapshot } = state;
		if (!initialSnapshot) return false;

		const currentValues = {
			age: state.age,
			drinking: state.drinking,
			goodMbti: state.goodMbti,
			badMbti: state.badMbti,
			personality: state.personality,
			militaryPreference: state.militaryPreference,
			smoking: state.smoking,
			tattoo: state.tattoo,
		};

		return JSON.stringify(initialSnapshot) !== JSON.stringify(currentValues);
	});

	const disabled = !hasChanges;

	useEffect(() => {
		if (isInitialized) {
			return;
		}

		if (!profileDetails?.preferences || !Array.isArray(profileDetails.preferences)) {
			return;
		}

		try {
			const preferences = profileDetails.preferences;
			const additionalPreferences = profileDetails.additionalPreferences;
			const locale = i18n.language;

			const drinkingPref = findPreferenceByType(preferences, PreferenceKeys.DRINKING, locale);
			const drinking = drinkingPref?.selectedOptions?.[0];

			const militaryPref = findPreferenceByType(
				preferences,
				PreferenceKeys.MILITARY_PREFERENCE,
				locale,
			);
			const militaryPreference = militaryPref?.selectedOptions?.[0];

			const smokingPref = findPreferenceByType(preferences, PreferenceKeys.SMOKING, locale);
			const smoking = smokingPref?.selectedOptions?.[0];

			const tattooPref = findPreferenceByType(preferences, PreferenceKeys.TATTOO, locale);
			const tattoo = tattooPref?.selectedOptions?.[0];

			const agePref = findPreferenceByType(preferences, PreferenceKeys.AGE, locale);
			const age = agePref?.selectedOptions?.[0];

			const personalityPref = findPreferenceByType(preferences, PreferenceKeys.PERSONALITY, locale);
			const personality = personalityPref?.selectedOptions;

			if (drinking?.id) {
				updateForm('drinking', drinking);
			}
			if (militaryPreference?.id && profileDetails.gender === 'FEMALE') {
				updateForm('militaryPreference', militaryPreference);
			}
			if (smoking?.id) {
				updateForm('smoking', smoking);
			}
			if (tattoo?.id) {
				updateForm('tattoo', tattoo);
			}
			if (age?.id) {
				updateForm('age', age.id);
			}
			if (Array.isArray(personality) && personality.length > 0) {
				const personalityIds = personality.filter((item) => item?.id).map((item) => item.id);
				if (personalityIds.length > 0) {
					updateForm('personality', personalityIds);
				}
			}

			if (additionalPreferences?.goodMbti !== undefined) {
				updateForm('goodMbti', additionalPreferences.goodMbti);
			}
			if (additionalPreferences?.badMbti !== undefined) {
				updateForm('badMbti', additionalPreferences.badMbti);
			}

			setInitialSnapshot({
				age: age?.id,
				drinking,
				goodMbti: additionalPreferences?.goodMbti ?? null,
				badMbti: additionalPreferences?.badMbti ?? null,
				personality:
					Array.isArray(personality) && personality.length > 0
						? personality.filter((item) => item?.id).map((item) => item.id)
						: [],
				militaryPreference: profileDetails.gender === 'FEMALE' ? militaryPreference : undefined,
				smoking,
				tattoo,
				init: true,
			});

			setIsInitialized(true);
		} catch (error) {
			console.error('Failed to initialize interest form:', error);
		}
	}, [profileDetails?.preferences, isInitialized, profileDetails?.gender, i18n.language]);

	useEffect(() => {
		return () => {
			console.log('Interest form unmounting - cleaning up');
		};
	}, []);

	const onFinish = async () => {
		setFormSubmitLoading(true);
		showLoading();
		await tryCatch(
			async () => {
				if (!form.age || typeof form.age !== 'string') {
					throw new Error(t('apps.profile_edit.ui.validation.age_required'));
				}

				if (!form.drinking?.id) {
					throw new Error(t('apps.profile_edit.ui.validation.drinking_required'));
				}

				if (!form.smoking?.id) {
					throw new Error(t('apps.profile_edit.ui.validation.smoking_required'));
				}

				if (!Array.isArray(form.personality) || form.personality.length === 0) {
					throw new Error(t('apps.profile_edit.ui.validation.personality_required'));
				}

				if (!form.tattoo?.id) {
					throw new Error(t('apps.profile_edit.ui.validation.tattoo_required'));
				}

				await savePreferences({
					age: form.age,
					drinking: form.drinking.id,
					smoking: form.smoking.id,
					personality: form.personality,
					tattoo: form.tattoo.id,
					militaryPreference: form.militaryPreference?.id ?? '',
					goodMbti: form.goodMbti ?? null,
					badMbti: form.badMbti ?? null,
				});

				// 프로필 데이터 다시 불러오기
				await queryClient.invalidateQueries({ queryKey: ['check-preference-fill'] });
				await queryClient.invalidateQueries({ queryKey: ['preference-self'] });
				await queryClient.invalidateQueries({ queryKey: ['my-profile-details'] });
				await queryClient.refetchQueries({ queryKey: ['check-preference-fill'] });
				await queryClient.refetchQueries({ queryKey: ['preference-self'] });
				await queryClient.refetchQueries({ queryKey: ['my-profile-details'] });

				// 폼 상태 리셋하여 새 데이터로 다시 초기화되도록 함
				setIsInitialized(false);

				setFormSubmitLoading(false);
				hideLoading();

				showModal({
					title: t('apps.profile_edit.ui.success_modal.title'),
					children: t('apps.profile_edit.ui.success_modal.description'),
					primaryButton: {
						text: t('apps.profile_edit.ui.success_modal.confirm_button'),
						onClick: () => {},
					},
				});
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
					err?.message || err?.error || t('apps.profile_edit.errors.preference_save_failed');
				showErrorModal(errorMessage, 'error');
				setFormSubmitLoading(false);
				hideLoading();
			},
		);
	};

	if (!profileDetails) {
		return null;
	}

	return (
		<View style={styles.container}>
			<ScrollView
				contentContainerStyle={{
					paddingBottom: insets.bottom + 100,
				}}
			>
				<InterestAge />
				<InterestGoodMbti />
				<InterestBadMbti />
				<InterestPersonality />
				{profileDetails.gender === 'FEMALE' && i18n.language !== 'ja' && <InterestMilitary />}
				<InterestDrinking />
				<InterestSmoking />
				<InterestTattoo />
			</ScrollView>
			<View
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					width: '100%',
					backgroundColor: '#FFFFFF',
					paddingHorizontal: 31,
					paddingBottom: insets.bottom + 15,
					paddingTop: 15,
				}}
			>
				<Button
					disabled={disabled || formSubmitLoading}
					onPress={onFinish}
					rounded="lg"
					styles={{ width: '100%' }}
				>
					{t('apps.profile_edit.ui.save_button')}
				</Button>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative',
	},
});

export default InterestSection;
