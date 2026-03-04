import Loading from '@/src/features/loading';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useToast } from '@/src/shared/hooks/use-toast';
import { BottomSheetPicker } from '@/src/shared/ui/bottom-sheet-picker';
import type { BottomSheetPickerOption } from '@/src/shared/ui/bottom-sheet-picker';
import { Text } from '@/src/shared/ui/text';
import BottomArrowIcon from '@assets/icons/bottom-arrow.svg';
import type { AxiosError } from 'axios';
import { useGlobalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSignupProgress } from '../../hooks';
import { useCreateDepartmentMutation, useDepartmentQuery } from '../../queries';

const MIN_TOUCH_TARGET = 48;
const CREATE_NEW_VALUE = '__CREATE_NEW__';

function DepartmentSearch() {
	const { t } = useTranslation();
	const { emitToast } = useToast();
	const {
		updateForm,
		form: { departmentName, universityId: formUniversityId },
	} = useSignupProgress();

	const [isVisible, setIsVisible] = useState(false);
	const [isInlineMode, setIsInlineMode] = useState(false);
	const [inlineDeptName, setInlineDeptName] = useState('');

	const { universityId } = useGlobalSearchParams<{
		universityId: string;
	}>();
	const effectiveUniversityId = universityId ?? formUniversityId;
	const { data: departments = [], isLoading } = useDepartmentQuery(effectiveUniversityId);
	const createDepartmentMutation = useCreateDepartmentMutation();

	const departmentOptions: BottomSheetPickerOption[] = useMemo(
		() => [
			...departments
				.filter((dept): dept is string => typeof dept === 'string' && dept.length > 0)
				.map((dept) => ({
					label: dept,
					value: dept,
				})),
			{
				label: t('features.signup.ui.department_direct_input_option'),
				value: CREATE_NEW_VALUE,
			},
		],
		[departments, t],
	);

	const handleSelect = (value: string) => {
		if (value === CREATE_NEW_VALUE) {
			setIsInlineMode(true);
			setIsVisible(false);
			return;
		}
		updateForm({ departmentName: value });
	};

	const handleInlineSubmit = async () => {
		if (!inlineDeptName.trim() || !effectiveUniversityId) return;

		try {
			await createDepartmentMutation.mutateAsync({
				universityId: effectiveUniversityId,
				name: inlineDeptName.trim(),
			});
			updateForm({ departmentName: inlineDeptName.trim() });
			setIsInlineMode(false);
			setInlineDeptName('');
		} catch (error) {
			const axiosError = error as AxiosError;
			if (axiosError?.response?.status === 409) {
				updateForm({ departmentName: inlineDeptName.trim() });
				setIsInlineMode(false);
				setInlineDeptName('');
			} else if (axiosError?.response?.status === 429) {
				emitToast(t('features.signup.ui.department_direct_rate_limit'));
			} else {
				emitToast(t('features.signup.ui.department_direct_error'));
			}
		}
	};

	const handleInlineCancel = () => {
		setIsInlineMode(false);
		setInlineDeptName('');
	};

	const hasValue = !!departmentName;

	if (isLoading) {
		return <Loading.Page title={t('features.signup.ui.department_search_loading')} />;
	}

	if (isInlineMode) {
		return (
			<View style={styles.container}>
				<View style={styles.inlineContainer}>
					<TextInput
						style={styles.inlineInput}
						value={inlineDeptName}
						onChangeText={setInlineDeptName}
						placeholder={t('features.signup.ui.department_direct_input_placeholder')}
						placeholderTextColor="#9B94AB"
						autoFocus
					/>
					<View style={styles.inlineButtons}>
						<Pressable
							onPress={handleInlineCancel}
							style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
						>
							<Text size="sm" weight="medium" textColor="secondary">
								{t('features.signup.ui.department_direct_cancel')}
							</Text>
						</Pressable>
						<Pressable
							onPress={handleInlineSubmit}
							disabled={!inlineDeptName.trim() || createDepartmentMutation.isPending}
							style={({ pressed }) => [
								styles.submitButton,
								(!inlineDeptName.trim() || createDepartmentMutation.isPending) &&
									styles.submitButtonDisabled,
								pressed && styles.buttonPressed,
							]}
						>
							{createDepartmentMutation.isPending ? (
								<ActivityIndicator color="#FFFFFF" size="small" />
							) : (
								<Text size="sm" weight="semibold" style={styles.submitButtonText}>
									{t('features.signup.ui.department_direct_submit')}
								</Text>
							)}
						</Pressable>
					</View>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Pressable
				onPress={() => setIsVisible(true)}
				style={({ pressed }) => [styles.selector, pressed && styles.selectorPressed]}
			>
				<Text
					size="md"
					weight={hasValue ? 'medium' : 'normal'}
					textColor={hasValue ? 'primary' : 'disabled'}
					style={styles.selectorText}
					numberOfLines={1}
				>
					{departmentName || t('features.signup.ui.department_search_placeholder')}
				</Text>
				<View style={styles.iconBox}>
					<BottomArrowIcon width={13} height={8} />
				</View>
			</Pressable>

			<BottomSheetPicker
				visible={isVisible}
				onClose={() => setIsVisible(false)}
				options={departmentOptions}
				selectedValue={departmentName}
				onSelect={handleSelect}
				title={t('features.signup.ui.department_search_title')}
				searchable={true}
				searchPlaceholder={t('features.signup.ui.department_search_placeholder')}
				emptyText={t('features.signup.ui.department_search_empty')}
				loading={isLoading}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
	},
	selector: {
		minHeight: MIN_TOUCH_TARGET,
		borderRadius: 15,
		borderWidth: 1,
		borderColor: semanticColors.brand.primary,
		backgroundColor: semanticColors.surface.background,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 12,
	},
	selectorPressed: {
		backgroundColor: semanticColors.surface.surface,
	},
	selectorText: {
		flex: 1,
	},
	iconBox: {
		flexShrink: 0,
		marginLeft: 8,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 10,
		width: 28,
		height: 28,
		backgroundColor: semanticColors.surface.other,
	},
	inlineContainer: {
		gap: 12,
	},
	inlineInput: {
		minHeight: MIN_TOUCH_TARGET,
		borderRadius: 15,
		borderWidth: 1,
		borderColor: semanticColors.brand.primary,
		backgroundColor: semanticColors.surface.background,
		paddingHorizontal: 12,
		fontSize: 16,
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-Regular',
	},
	inlineButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	cancelButton: {
		flex: 1,
		minHeight: 44,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: semanticColors.border.default,
		backgroundColor: semanticColors.surface.background,
		alignItems: 'center',
		justifyContent: 'center',
	},
	submitButton: {
		flex: 1,
		minHeight: 44,
		borderRadius: 12,
		backgroundColor: semanticColors.brand.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	submitButtonDisabled: {
		opacity: 0.4,
	},
	submitButtonText: {
		color: '#FFFFFF',
	},
	buttonPressed: {
		opacity: 0.85,
	},
});

export default DepartmentSearch;
