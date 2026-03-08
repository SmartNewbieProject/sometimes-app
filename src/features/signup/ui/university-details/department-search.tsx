import Loading from '@/src/features/loading';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useDebounce } from '@/src/shared/hooks/use-debounce';
import { useToast } from '@/src/shared/hooks/use-toast';
import { BottomSheetPicker } from '@/src/shared/ui/bottom-sheet-picker';
import type { BottomSheetPickerOption } from '@/src/shared/ui/bottom-sheet-picker';
import { Text } from '@/src/shared/ui/text';
import BottomArrowIcon from '@assets/icons/bottom-arrow.svg';
import type { AxiosError } from 'axios';
import { useGlobalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSignupProgress } from '../../hooks';
import {
	useCreateDepartmentMutation,
	useDepartmentQuery,
	useSearchDepartmentsQuery,
} from '../../queries';

const MIN_TOUCH_TARGET = 48;

function DepartmentSearch() {
	const { t } = useTranslation();
	const { emitToast } = useToast();
	const {
		updateForm,
		form: { departmentName, universityId: formUniversityId },
	} = useSignupProgress();

	const [isVisible, setIsVisible] = useState(false);
	// false: 현재 학교 학과 목록, true: 외부(전체 대학) 학과 검색 모드
	const [isCrossMode, setIsCrossMode] = useState(false);
	const [pickerSearchQuery, setPickerSearchQuery] = useState('');
	const debouncedSearchQuery = useDebounce(pickerSearchQuery, 300);

	const { universityId } = useGlobalSearchParams<{
		universityId: string;
	}>();
	const effectiveUniversityId = universityId ?? formUniversityId;

	// 현재 학교 학과 목록 (BottomSheetPicker 내부에서 로컬 필터링)
	const { data: departments = [], isLoading } = useDepartmentQuery(effectiveUniversityId);

	// 외부 검색: 다른 대학 포함 전체 학과 검색 (cross mode에서만 활성화)
	const { data: searchResults = [], isFetching: isSearchFetching } = useSearchDepartmentsQuery(
		isCrossMode ? debouncedSearchQuery : '',
	);

	const createDepartmentMutation = useCreateDepartmentMutation();

	const departmentOptions: BottomSheetPickerOption[] = useMemo(() => {
		if (isCrossMode) {
			return searchResults.map((item) => ({
				label: item.name,
				value: item.name,
				subtitle: item.universityName,
			}));
		}
		return departments
			.filter((dept): dept is string => typeof dept === 'string' && dept.length > 0)
			.map((dept) => ({ label: dept, value: dept, compact: true }));
	}, [isCrossMode, searchResults, departments]);

	const handleSelect = async (value: string) => {
		if (isCrossMode && effectiveUniversityId) {
			// 다른 학교 학과 선택 → 현재 학교에 등록
			const alreadyExists = departments.includes(value);
			if (!alreadyExists) {
				try {
					await createDepartmentMutation.mutateAsync({
						universityId: effectiveUniversityId,
						name: value,
					});
				} catch (error) {
					const axiosError = error as AxiosError;
					if (axiosError?.response?.status === 409) {
						// 이미 등록됨, 그냥 선택
					} else if (axiosError?.response?.status === 429) {
						emitToast(t('features.signup.ui.department_direct_rate_limit'));
						return;
					} else {
						emitToast(t('features.signup.ui.department_direct_error'));
						return;
					}
				}
			}
		}
		updateForm({ departmentName: value });
	};

	const handleClose = () => {
		setIsVisible(false);
		setIsCrossMode(false);
		setPickerSearchQuery('');
	};

	// "내가 찾는 학과가 없다면?" 버튼 — 피커를 닫지 않고 cross mode로 전환
	const noDeptFooter = !isCrossMode ? (
		<Pressable
			onPress={() => {
				setIsCrossMode(true);
				setPickerSearchQuery('');
			}}
			style={({ pressed }) => [styles.noDeptButton, pressed && styles.buttonPressed]}
		>
			<Text size="sm" weight="medium" textColor="purple">
				{t('features.signup.ui.department_no_dept_button')}
			</Text>
		</Pressable>
	) : null;

	const hasValue = !!departmentName;

	if (isLoading) {
		return <Loading.Page title={t('features.signup.ui.department_search_loading')} />;
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
				onClose={handleClose}
				options={departmentOptions}
				selectedValue={departmentName}
				onSelect={handleSelect}
				title={
					isCrossMode
						? t('features.signup.ui.department_cross_dept_title')
						: t('features.signup.ui.department_search_title')
				}
				searchable={true}
				searchPlaceholder={t('features.signup.ui.department_search_placeholder')}
				emptyText={t('features.signup.ui.department_search_empty')}
				loading={
					(isCrossMode && debouncedSearchQuery.trim().length > 0 && isSearchFetching) ||
					createDepartmentMutation.isPending
				}
				onSearchChange={isCrossMode ? setPickerSearchQuery : undefined}
				listFooterComponent={noDeptFooter}
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
	noDeptButton: {
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: semanticColors.brand.primary,
	},
	buttonPressed: {
		opacity: 0.7,
	},
});

export default DepartmentSearch;
