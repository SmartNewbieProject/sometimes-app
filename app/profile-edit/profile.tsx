import { useAuth } from '@/src/features/auth';
import { usePreferenceSelfQuery } from '@/src/features/home/queries';
import Layout from '@/src/features/layout';
import PageLoading from '@/src/features/loading/ui/page';
import MyInfo from '@/src/features/my-info';
import { PreferenceKeys, findPreferenceByType } from '@/src/features/my-info/queries';
import { savePreferences } from '@/src/features/my-info/services';
import { useMbti } from '@/src/features/mypage/hooks';
import ProfileDatingStyle from '@/src/features/profile-edit/ui/profile/profile-dating-style';
import ProfileDrinking from '@/src/features/profile-edit/ui/profile/profile-drinking';
import ProfileImageSection from '@/src/features/profile-edit/ui/profile/profile-image-section';
import ProfileInterest from '@/src/features/profile-edit/ui/profile/profile-interest';
import ProfileMbti from '@/src/features/profile-edit/ui/profile/profile-mbti';
import ProfileMilitary from '@/src/features/profile-edit/ui/profile/profile-military';
import ProfilePersonality from '@/src/features/profile-edit/ui/profile/profile-personality';
import ProfileSmoking from '@/src/features/profile-edit/ui/profile/profile-smoking';
import ProfileTattoo from '@/src/features/profile-edit/ui/profile/profile-tattoo';
import { queryClient } from '@/src/shared/config/query';
import { useModal } from '@/src/shared/hooks/use-modal';
import { tryCatch } from '@/src/shared/libs';
import { Button } from '@/src/shared/ui';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { hooks } = MyInfo;
const { useMyInfoForm } = hooks;

function ProfileContent() {
	const { t, i18n } = useTranslation();
	const { updateForm, ...form } = useMyInfoForm();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { updateMbtiAsync } = useMbti();

	const { profileDetails } = useAuth();
	const [formSubmitLoading, setFormSubmitLoading] = useState(false);
	const { showErrorModal, showModal } = useModal();
	const { data: preferenceSelfFromAPI = [] } = usePreferenceSelfQuery();

	// profileDetails.characteristics와 preferences를 합침 (백엔드 버그 대응)
	const profileDetailsWithPrefs = profileDetails as any;
	const characteristicsArray = profileDetailsWithPrefs?.characteristics || [];
	const preferencesArray = profileDetailsWithPrefs?.preferences || [];

	// characteristics + preferences에서 본인 특성 타입만 추출
	const selfCharacteristicTypes = [
		'관심사',
		'성격',
		'연애 스타일',
		'趣味',
		'性格',
		'恋愛スタイル',
		'Interest',
		'Personality',
		'Dating Style',
	];
	const characteristicsFromPreferences = preferencesArray.filter((p: any) =>
		selfCharacteristicTypes.includes(p.typeName),
	);

	const preferenceSelf =
		[...characteristicsArray, ...characteristicsFromPreferences].length > 0
			? [...characteristicsArray, ...characteristicsFromPreferences]
			: preferenceSelfFromAPI;

	const setInitialSnapshot = useMyInfoForm((state) => state.setInitialSnapshot);
	const [scrollEnabled, setScrollEnabled] = useState(true);
	const hasChanges = useMyInfoForm((state) => {
		const {
			initialSnapshot,
			drinking,
			mbti,
			init,
			interestIds,
			datingStyleIds,
			militaryStatus,
			personality,
			smoking,
			tattoo,
		} = state;

		if (!initialSnapshot) return false;

		const currentValues = {
			drinking,
			mbti,
			init,
			interestIds,
			datingStyleIds,
			militaryStatus,
			personality,
			smoking,
			tattoo,
		};

		return JSON.stringify(initialSnapshot) !== JSON.stringify(currentValues);
	});

	useFocusEffect(
		useCallback(() => {
			// 페이지 포커스 시 데이터 refetch 후 폼 상태 리셋
			const refetchData = async () => {
				await Promise.all([
					queryClient.refetchQueries({ queryKey: ['my-profile-details'] }),
					queryClient.refetchQueries({ queryKey: ['preference-self'] }),
				]);
				updateForm('init', false);
			};
			refetchData();
		}, [updateForm]),
	);

	const disabled = !hasChanges;

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (profileDetails?.id && preferenceSelf && !form.init) {
			const drinkingData = findPreferenceByType(
				preferenceSelf,
				PreferenceKeys.DRINKING,
				i18n.language,
			);
			const drinking = drinkingData?.selectedOptions[0];

			const militaryData = findPreferenceByType(
				preferenceSelf,
				PreferenceKeys.MILITARY_STATUS,
				i18n.language,
			);
			const militaryStatus = militaryData?.selectedOptions[0];

			const smokingData = findPreferenceByType(
				preferenceSelf,
				PreferenceKeys.SMOKING,
				i18n.language,
			);
			const smoking = smokingData?.selectedOptions[0];

			const tattooData = findPreferenceByType(preferenceSelf, PreferenceKeys.TATTOO, i18n.language);
			const tattoo = tattooData?.selectedOptions[0];
			if (drinking) {
				updateForm('drinking', drinking);
			}
			if (militaryStatus && profileDetails.gender === 'MALE' && i18n.language !== 'ja') {
				updateForm('militaryStatus', militaryStatus);
			}
			if (smoking) {
				updateForm('smoking', smoking);
			}
			if (tattoo) {
				updateForm('tattoo', tattoo);
			}
			updateForm('mbti', profileDetails.mbti ?? undefined);

			const interestData = findPreferenceByType(
				preferenceSelf,
				PreferenceKeys.INTEREST,
				i18n.language,
			);
			const interestIds = interestData?.selectedOptions?.map(
				(item: { id: string }) => item.id,
			) as string[];
			updateForm('interestIds', interestIds);

			const datingStyleData = findPreferenceByType(
				preferenceSelf,
				PreferenceKeys.DATING_STYLE,
				i18n.language,
			);
			const datingStyleIdsRaw = datingStyleData?.selectedOptions?.map(
				(item: { id: string }) => item.id,
			) as string[];
			const datingStyleIds = datingStyleIdsRaw ? Array.from(new Set(datingStyleIdsRaw)) : [];
			updateForm('datingStyleIds', datingStyleIds);

			const personalityData = findPreferenceByType(
				preferenceSelf,
				PreferenceKeys.PERSONALITY,
				i18n.language,
			);
			const personalityIds = personalityData?.selectedOptions?.map(
				(item: { id: string }) => item.id,
			) as string[];
			updateForm('personality', personalityIds);

			updateForm('init', true);

			// 초기 스냅샷 저장 (프로필 이미지 제외)
			setInitialSnapshot({
				drinking,
				mbti: profileDetails.mbti ?? undefined,
				init: true,
				interestIds,
				datingStyleIds,
				militaryStatus,
				personality: personalityIds,
				smoking,
				tattoo,
			});
		}
	}, [
		preferenceSelf,
		profileDetails?.id,
		profileDetails?.mbti,
		profileDetails?.gender,
		form.init,
		setInitialSnapshot,
	]);

	const onFinish = async () => {
		if (formSubmitLoading) return;

		setFormSubmitLoading(true);
		await tryCatch(
			async () => {
				const emptyFields = [];
				if (!form.drinking) emptyFields.push(t('apps.profile_edit.profile.fields.drinking'));
				if (!form.smoking) emptyFields.push(t('apps.profile_edit.profile.fields.smoking'));
				if (!form.tattoo) emptyFields.push(t('apps.profile_edit.profile.fields.tattoo'));
				if (!form.personality || form.personality.length === 0)
					emptyFields.push(t('apps.profile_edit.profile.fields.personality'));
				if (!form.datingStyleIds || form.datingStyleIds.length === 0)
					emptyFields.push(t('apps.profile_edit.profile.fields.dating_style'));
				if (!form.interestIds || form.interestIds.length === 0)
					emptyFields.push(t('apps.profile_edit.profile.fields.interests'));
				if (!form.mbti) emptyFields.push(t('apps.profile_edit.profile.fields.mbti'));
				if (profileDetails?.gender === 'MALE' && i18n.language !== 'ja' && !form.militaryStatus)
					emptyFields.push(t('apps.profile_edit.profile.fields.military_status'));

				if (emptyFields.length > 0) {
					const message = t('apps.profile_edit.profile.validation.required_fields', {
						fields: emptyFields.join(', '),
					});
					console.error('Validation failed:', { emptyFields, form });
					throw new Error(message);
				}

				await savePreferences({
					datingStyleIds: form.datingStyleIds,
					interestIds: form.interestIds,
					drinking: form.drinking?.id as string,
					smoking: form.smoking?.id as string,
					tattoo: form.tattoo?.id as string,
					personality: form.personality as string[],
					militaryStatus: form.militaryStatus?.id as string,

					mbti: form.mbti as string,
				});
				if (profileDetails?.mbti !== form.mbti) {
					await updateMbtiAsync(form.mbti as string);
				}

				// 프로필 데이터 다시 불러오기
				await queryClient.invalidateQueries({
					queryKey: ['preference-self'],
				});
				await queryClient.invalidateQueries({
					queryKey: ['my-profile-details'],
				});
				await queryClient.refetchQueries({
					queryKey: ['preference-self'],
				});
				await queryClient.refetchQueries({
					queryKey: ['my-profile-details'],
				});

				// 폼 상태 리셋하여 새 데이터로 다시 초기화되도록 함
				updateForm('init', false);

				setFormSubmitLoading(false);

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
				console.error('Profile save error:', {
					error: serverError,
					errorMessage: err?.message,
					errorString: err?.error,
					status: err?.status,
					statusCode: err?.statusCode,
					form,
				});

				const errorMessage =
					err?.message || err?.error || t('features.profile-edit.errors.save_failed');
				showErrorModal(errorMessage, 'error');
				setFormSubmitLoading(false);
			},
		);
	};

	if (formSubmitLoading) {
		return <PageLoading />;
	}

	const handleSliderTouchStart = useCallback(() => {
		setScrollEnabled(false);
	}, []);

	const handleSliderTouchEnd = useCallback(() => {
		setScrollEnabled(true);
	}, []);

	return (
		<View style={styles.container}>
			<ScrollView
				scrollEnabled={scrollEnabled}
				contentContainerStyle={{
					paddingBottom: insets.bottom + 100,
				}}
			>
				<ProfileImageSection />
				<ProfileMbti />
				<ProfileInterest />
				<ProfilePersonality />
				<ProfileDatingStyle />
					{profileDetails?.gender === 'MALE' && i18n.language !== 'ja' && (
						<ProfileMilitary />
					)}
					<ProfileDrinking />
					<ProfileSmoking />
					<ProfileTattoo />
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

function Profile() {
	return (
		<Suspense fallback={<PageLoading />}>
			<ProfileContent />
		</Suspense>
	);
}

export default Profile;
