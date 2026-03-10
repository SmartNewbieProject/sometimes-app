import { useAuth } from '@/src/features/auth';
import { usePreferenceSelfQuery } from '@/src/features/home/queries';
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
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { hooks } = MyInfo;
const { useMyInfoForm } = hooks;

function ProfileContentInner() {
	const { t, i18n } = useTranslation();
	const { updateForm, ...form } = useMyInfoForm();
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
	const initialSnapshot = useMyInfoForm((state) => state.initialSnapshot);
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
			// 스냅샷은 별도 useEffect에서 설정 (child component 의 useEffect가 settle된 후)
		}
	}, [
		preferenceSelf,
		profileDetails?.id,
		profileDetails?.mbti,
		profileDetails?.gender,
		form.init,
		setInitialSnapshot,
	]);

	// 초기화 완료 후 child effect가 모두 settle된 다음 프레임에서 스냅샷 캡처
	// MbtiSelector 등 child component가 마운트 시 onChange를 발생시켜 store를 변경하므로,
	// 즉시 스냅샷을 잡으면 불일치가 발생함
	useEffect(() => {
		if (form.init && !initialSnapshot) {
			const frameId = requestAnimationFrame(() => {
				const currentState = useMyInfoForm.getState();
				setInitialSnapshot({
					drinking: currentState.drinking,
					mbti: currentState.mbti,
					init: true,
					interestIds: currentState.interestIds,
					datingStyleIds: currentState.datingStyleIds,
					militaryStatus: currentState.militaryStatus,
					personality: currentState.personality,
					smoking: currentState.smoking,
					tattoo: currentState.tattoo,
				});
			});
			return () => cancelAnimationFrame(frameId);
		}
	}, [form.init, initialSnapshot, setInitialSnapshot]);

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

				// 저장된 값을 새 기준점으로 설정 (hasChanges가 false가 되어 저장 버튼 비활성화)
				// init을 false로 리셋하면 빈 preferenceSelf로 재초기화되는 race condition이 발생하므로 사용 금지
				setInitialSnapshot({
					drinking: form.drinking,
					mbti: form.mbti,
					init: true,
					interestIds: form.interestIds,
					datingStyleIds: form.datingStyleIds,
					militaryStatus: form.militaryStatus,
					personality: form.personality,
					smoking: form.smoking,
					tattoo: form.tattoo,
				});

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

export default function ProfileContent() {
	return (
		<Suspense fallback={<PageLoading />}>
			<ProfileContentInner />
		</Suspense>
	);
}
