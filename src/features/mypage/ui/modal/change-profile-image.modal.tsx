import { useAuth } from '@/src/features/auth/hooks/use-auth';
import apis from '@/src/features/mypage/apis';
import { useModal } from '@/src/shared/hooks/use-modal';
import { useStorage } from '@/src/shared/hooks/use-storage';
import { Button, ImageSelector, Text } from '@/src/shared/ui';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

export const ChangeProfileImageModal = () => {
	const { hideModal, showErrorModal } = useModal();
	const { profileDetails } = useAuth();
	const queryClient = useQueryClient();
	const { value: accessToken } = useStorage<string | null>({
		key: 'access-token',
		initialValue: null,
	});

	const [images, setImages] = useState<(string | null)[]>([null, null, null]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const validImages = images.filter((img) => img !== null);
	const isAllImagesSelected = validImages.length === 3;

	useEffect(() => {
		setImages([null, null, null]);
	}, [profileDetails]);

	useEffect(() => {
		setIsSubmitting(false);
	}, []);

	const handleImageChange = (index: number, value: string) => {
		const newImages = [...images];
		newImages[index] = value;
		setImages(newImages);
	};

	const replaceExistingImage = async (newImage: string, oldImages: any[]) => {
		if (oldImages[0]) {
			await apis.deleteProfileImage(oldImages[0].id);
			oldImages.shift();
		}
		await apis.uploadProfileImage(newImage, 2);
	};

	const addNewImage = async (newImage: string, index: number) => {
		await apis.uploadProfileImage(newImage, index);
	};

	const cleanupRemainingImages = async (oldImages: any[], startIndex: number) => {
		for (let i = startIndex; i < oldImages.length; i++) {
			await apis.deleteProfileImage(oldImages[i].id).catch(() => {});
		}
	};

	const getErrorMessage = (error: any) => {
		return error?.response?.data?.message || error?.message || '알 수 없는 오류가 발생했습니다.';
	};

	const handleSubmit = async () => {
		if (!profileDetails) {
			showErrorModal('프로필 정보를 불러올 수 없습니다.', 'error');
			return;
		}

		const validImages = images.filter((img) => img !== null) as string[];
		if (validImages.length !== 3) {
			showErrorModal('프로필 이미지 3장을 모두 등록해주세요.', 'announcement');
			return;
		}

		setIsSubmitting(true);

		try {
			const oldImages = [...(profileDetails.profileImages || [])];
			const hasExistingImages = oldImages.length > 0;

			if (hasExistingImages) {
				for (let i = 0; i < validImages.length; i++) {
					await replaceExistingImage(validImages[i], oldImages);
				}
			} else {
				for (let i = 0; i < validImages.length; i++) {
					await addNewImage(validImages[i], i);
				}
			}

			if (oldImages.length > validImages.length) {
				await cleanupRemainingImages(oldImages, validImages.length);
			}

			await queryClient.invalidateQueries({ queryKey: ['my-profile-details'] });
			hideModal();
			showErrorModal('프로필 이미지가 성공적으로 변경되었습니다.', 'announcement');
		} catch (error: any) {
			showErrorModal(
				`프로필 이미지 변경 중 오류가 발생했습니다: ${getErrorMessage(error)}`,
				'error',
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!profileDetails) {
		return (
			<View className="items-center justify-center p-4">
				<ActivityIndicator size="large" color="#6A3EA1" />
				<Text className="mt-2 text-center" textColor="black">
					프로필 정보를 불러오는 중...
				</Text>
			</View>
		);
	}

	return (
		<View className="w-full">
			<Text className="text-lg font-semibold mb-4 text-center" textColor="black">
				프로필 이미지 변경
			</Text>

			<Text className="mb-4 text-center" textColor="black">
				매칭을 위해 프로필 사진 3장을 모두 등록해주세요.
			</Text>

			<View className="mb-6">
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{
						paddingHorizontal: 20,
						gap: 16,
						alignItems: 'center',
						justifyContent: 'center',
						minWidth: '100%',
					}}
					className="mb-4"
				>
					{images.map((image, index) => (
						<View key={index} style={{ width: 120, height: 120 }}>
							<ImageSelector
								size="sm"
								value={image ?? undefined}
								onChange={(value) => handleImageChange(index, value)}
							/>
						</View>
					))}
				</ScrollView>
				<Text className="text-xs text-center" textColor="gray">
					얼굴이 잘 보이는 사진을 업로드해주세요. (최대 20MB)
				</Text>
				<Text className="text-xs text-center mt-1" textColor="gray">
					좌우로 스크롤하여 이미지를 추가해주세요.
				</Text>
			</View>

			<View className="flex flex-row gap-x-2">
				<Button variant="secondary" onPress={hideModal} className="flex-1" disabled={isSubmitting}>
					취소
				</Button>
				<Button
					variant="primary"
					onPress={handleSubmit}
					className="flex-1"
					disabled={isSubmitting || !isAllImagesSelected}
				>
					{isSubmitting ? '변경 중...' : '변경 완료'}
				</Button>
			</View>
		</View>
	);
};

export default ChangeProfileImageModal;
