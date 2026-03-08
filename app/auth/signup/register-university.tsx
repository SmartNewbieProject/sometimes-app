import { useSignupProgress } from '@/src/features/signup/hooks';
import {
	useCreateDepartmentMutation,
	useCreateUniversityMutation,
	useRegionsListQuery,
	useSearchDepartmentsQuery,
} from '@/src/features/signup/queries';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useDebounce } from '@/src/shared/hooks';
import { useToast } from '@/src/shared/hooks/use-toast';
import { PalePurpleGradient } from '@/src/shared/ui';
import { BottomSheetPicker } from '@/src/shared/ui/bottom-sheet-picker';
import { Header } from '@/src/shared/ui/header';
import { Ionicons } from '@expo/vector-icons';
import type { AxiosError } from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActivityIndicator,
	FlatList,
	Keyboard,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
	useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterUniversityPage() {
	const router = useRouter();
	const { t } = useTranslation();
	const { name } = useLocalSearchParams<{ name?: string }>();
	const { emitToast } = useToast();
	const { updateForm, updateRegions, updateUnivTitle } = useSignupProgress();

	const [currentStep, setCurrentStep] = useState(1);
	const [universityName, setUniversityName] = useState(name ?? '');
	const [selectedRegion, setSelectedRegion] = useState('');
	const [regionPickerVisible, setRegionPickerVisible] = useState(false);
	const [departmentName, setDepartmentName] = useState('');
	const [isDeptSelected, setIsDeptSelected] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [registeredUnivId, setRegisteredUnivId] = useState('');
	const [registeredUnivName, setRegisteredUnivName] = useState('');
	const deptInputRef = useRef<TextInput>(null);
	const { height: screenHeight } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const [keyboardHeight, setKeyboardHeight] = useState(0);

	useEffect(() => {
		const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
			setKeyboardHeight(e.endCoordinates.height);
		});
		const hideSub = Keyboard.addListener('keyboardDidHide', () => {
			setKeyboardHeight(0);
		});
		return () => {
			showSub.remove();
			hideSub.remove();
		};
	}, []);

	// Header(~56) + stepIndicator(~34) + title(~30) + subtitle(~54) + univField(~76) + deptLabel+input(~76) + button(~92)
	// = ~418px overhead. 남은 공간을 suggestions에 할당
	const suggestionsMaxHeight = Math.max(
		150,
		screenHeight - insets.top - insets.bottom - keyboardHeight - 420,
	);

	const { data: regions = [], isLoading: regionsLoading } = useRegionsListQuery();
	const createUniversityMutation = useCreateUniversityMutation();
	const createDepartmentMutation = useCreateDepartmentMutation();

	const debouncedDeptKeyword = useDebounce(departmentName, 300);
	const { data: deptSuggestions = [], isFetching: isDeptFetching } = useSearchDepartmentsQuery(
		isDeptSelected ? '' : debouncedDeptKeyword,
	);
	// 타이핑 중(디바운스 대기)이거나 API 요청 중일 때 모두 로딩 표시
	const isDeptSearching =
		isDeptFetching ||
		(!isDeptSelected && departmentName.trim().length > 0 && departmentName !== debouncedDeptKeyword);

	const regionOptions = useMemo(
		() => regions.map((r) => ({ label: r.name, value: r.code })),
		[regions],
	);

	const selectedRegionLabel = useMemo(
		() => regions.find((r) => r.code === selectedRegion)?.name ?? '',
		[regions, selectedRegion],
	);

	const canProceedStep1 = universityName.trim().length > 0 && selectedRegion.length > 0;
	const canProceedStep2 = departmentName.trim().length > 0;

	const handleDeptChange = (text: string) => {
		setDepartmentName(text);
		setIsDeptSelected(false);
		setShowSuggestions(text.trim().length > 0);
	};

	const handleDeptSelect = (deptName: string) => {
		setDepartmentName(deptName);
		setIsDeptSelected(true);
		setShowSuggestions(false);
		deptInputRef.current?.blur();
	};

	const handleCreateUniversity = async () => {
		try {
			const result = await createUniversityMutation.mutateAsync({
				name: universityName.trim(),
				region: selectedRegion,
			});
			setRegisteredUnivId(result.id);
			setRegisteredUnivName(result.name);
			updateForm({ universityId: result.id });
			updateRegions([selectedRegion]);
			updateUnivTitle(result.name);
			setCurrentStep(2);
		} catch (error) {
			const axiosError = error as AxiosError;
			if (axiosError?.response?.status === 409) {
				emitToast(t('apps.auth.sign_up.register_university.error_duplicate_university'));
			} else if (axiosError?.response?.status === 429) {
				emitToast(t('apps.auth.sign_up.register_university.error_rate_limit'));
			} else {
				emitToast(t('apps.auth.sign_up.register_university.error_generic'));
			}
		}
	};

	const handleCreateDepartment = async () => {
		try {
			await createDepartmentMutation.mutateAsync({
				universityId: registeredUnivId,
				name: departmentName.trim(),
			});
			updateForm({ departmentName: departmentName.trim() });
			router.replace(`/auth/signup/university-cluster?universityId=${registeredUnivId}`);
		} catch (error) {
			const axiosError = error as AxiosError;
			if (axiosError?.response?.status === 409) {
				updateForm({ departmentName: departmentName.trim() });
				router.replace(`/auth/signup/university-cluster?universityId=${registeredUnivId}`);
			} else if (axiosError?.response?.status === 429) {
				emitToast(t('apps.auth.sign_up.register_university.error_rate_limit'));
			} else {
				emitToast(t('apps.auth.sign_up.register_university.error_generic'));
			}
		}
	};

	const isSubmitting = createUniversityMutation.isPending || createDepartmentMutation.isPending;

	const handleBackPress = () => {
		if (currentStep === 2) {
			setCurrentStep(1);
		} else {
			router.back();
		}
	};

	return (
		<View style={styles.layout}>
			<PalePurpleGradient />
			<Header
				title={
					currentStep === 1
						? t('apps.auth.sign_up.register_university.step1_title')
						: t('apps.auth.sign_up.register_university.step2_title')
				}
				showBackButton
				showLogo={false}
				onBackPress={handleBackPress}
			/>
			<View style={styles.flex}>
				<View style={styles.container}>
					<View style={styles.stepIndicatorRow}>
						<View style={[styles.stepDot, styles.stepDotActive]} />
						<View style={[styles.stepBar, currentStep >= 2 && styles.stepBarActive]} />
						<View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]} />
					</View>

					{currentStep === 1 ? (
						<ScrollView
							style={styles.flex}
							contentContainerStyle={styles.scrollContent}
							keyboardShouldPersistTaps="handled"
							showsVerticalScrollIndicator={false}
						>
							<Text style={styles.stepTitle}>
								{t('apps.auth.sign_up.register_university.step1_title')}
							</Text>
							<Text style={styles.stepSubtitle}>
								{t('apps.auth.sign_up.register_university.step1_subtitle')}
							</Text>

							<View style={styles.fieldContainer}>
								<Text style={styles.fieldLabel}>
									{t('apps.auth.sign_up.register_university.university_name_label')}
								</Text>
								<TextInput
									style={styles.textInput}
									value={universityName}
									onChangeText={setUniversityName}
									placeholder={t(
										'apps.auth.sign_up.register_university.university_name_placeholder',
									)}
									placeholderTextColor="#9B94AB"
								/>
							</View>

							<View style={styles.fieldContainer}>
								<Text style={styles.fieldLabel}>
									{t('apps.auth.sign_up.register_university.region_label')}
								</Text>
								<Pressable
									onPress={() => setRegionPickerVisible(true)}
									style={({ pressed }) => [
										styles.selectorButton,
										pressed && styles.selectorButtonPressed,
									]}
								>
									<Text
										style={[styles.selectorText, !selectedRegion && styles.selectorPlaceholder]}
									>
										{selectedRegionLabel ||
											t('apps.auth.sign_up.register_university.region_placeholder')}
									</Text>
								</Pressable>
							</View>

							<View style={styles.noticeCard}>
								<Ionicons
									name="information-circle-outline"
									size={18}
									color={semanticColors.brand.primary}
								/>
								<View style={styles.noticeTextWrapper}>
									<Text style={styles.noticeText}>
										{t('apps.auth.sign_up.register_university.admin_review_notice')}
									</Text>
									<Text style={styles.noticeSubText}>
										{t('apps.auth.sign_up.register_university.admin_review_detail')}
									</Text>
								</View>
							</View>

							<View style={styles.bottomArea}>
								<Pressable
									onPress={handleCreateUniversity}
									disabled={!canProceedStep1 || isSubmitting}
									style={({ pressed }) => [
										styles.primaryButton,
										(!canProceedStep1 || isSubmitting) && styles.primaryButtonDisabled,
										pressed && canProceedStep1 && !isSubmitting && styles.primaryButtonPressed,
									]}
								>
									{isSubmitting ? (
										<ActivityIndicator color="#FFFFFF" size="small" />
									) : (
										<Text style={styles.primaryButtonText}>
											{t('apps.auth.sign_up.register_university.next_step')}
										</Text>
									)}
								</Pressable>
							</View>

							<BottomSheetPicker
								visible={regionPickerVisible}
								onClose={() => setRegionPickerVisible(false)}
								options={regionOptions}
								selectedValue={selectedRegion}
								onSelect={(value) => {
									setSelectedRegion(value);
									setRegionPickerVisible(false);
								}}
								title={t('apps.auth.sign_up.register_university.region_picker_title')}
								searchable={true}
								searchPlaceholder={t('apps.auth.sign_up.register_university.region_placeholder')}
								loading={regionsLoading}
							/>
						</ScrollView>
					) : (
						<View style={styles.flex}>
							<View style={styles.step2Content}>
								<Text style={styles.stepTitle}>
									{t('apps.auth.sign_up.register_university.step2_title')}
								</Text>
								<Text style={styles.stepSubtitle}>
									{t('apps.auth.sign_up.register_university.step2_subtitle')}
								</Text>

								<View style={styles.fieldContainer}>
									<Text style={styles.fieldLabel}>
										{t('apps.auth.sign_up.register_university.university_name_label')}
									</Text>
									<View style={styles.registeredField}>
										<Text style={styles.registeredText}>{registeredUnivName}</Text>
										<Text style={styles.registeredBadge}>
											{t('apps.auth.sign_up.register_university.university_registered')}
										</Text>
									</View>
								</View>

								<View style={styles.fieldContainer}>
									<Text style={styles.fieldLabel}>
										{t('apps.auth.sign_up.register_university.department_name_label')}
									</Text>
									<View style={styles.autocompleteWrapper}>
										<TextInput
											ref={deptInputRef}
											style={[styles.textInput, isDeptSelected && styles.textInputSelected]}
											value={departmentName}
											onChangeText={handleDeptChange}
											onFocus={() => {
												if (departmentName.trim().length > 0 && !isDeptSelected) {
													setShowSuggestions(true);
												}
											}}
											placeholder={t(
												'apps.auth.sign_up.register_university.department_name_placeholder',
											)}
											placeholderTextColor="#9B94AB"
											autoFocus
										/>
										{showSuggestions && (
											<View
												style={[styles.suggestionsContainer, { maxHeight: suggestionsMaxHeight }]}
											>
												{isDeptSearching ? (
													<View style={styles.suggestionLoading}>
														<ActivityIndicator size="small" color={semanticColors.brand.primary} />
													</View>
												) : deptSuggestions.length > 0 ? (
													<FlatList
														data={deptSuggestions}
														keyExtractor={(item) => item.id}
														keyboardShouldPersistTaps="handled"
														style={{ maxHeight: suggestionsMaxHeight }}
														renderItem={({ item }) => (
															<Pressable
																onPress={() => handleDeptSelect(item.name)}
																style={({ pressed }) => [
																	styles.suggestionItem,
																	pressed && styles.suggestionItemPressed,
																]}
															>
																<Text style={styles.suggestionName}>{item.name}</Text>
																<Text style={styles.suggestionUniv}>{item.universityName}</Text>
															</Pressable>
														)}
													/>
												) : debouncedDeptKeyword.trim().length > 0 ? (
													<View style={styles.suggestionEmpty}>
														<Text style={styles.suggestionEmptyText}>
															{t('apps.auth.sign_up.register_university.department_no_results')}
														</Text>
													</View>
												) : null}
											</View>
										)}
									</View>
								</View>
							</View>

							<View style={styles.step2ButtonArea}>
								<Pressable
									onPress={handleCreateDepartment}
									disabled={!canProceedStep2 || isSubmitting}
									style={({ pressed }) => [
										styles.primaryButton,
										(!canProceedStep2 || isSubmitting) && styles.primaryButtonDisabled,
										pressed && canProceedStep2 && !isSubmitting && styles.primaryButtonPressed,
									]}
								>
									{isSubmitting ? (
										<ActivityIndicator color="#FFFFFF" size="small" />
									) : (
										<Text style={styles.primaryButtonText}>
											{t('apps.auth.sign_up.register_university.complete')}
										</Text>
									)}
								</Pressable>
							</View>
						</View>
					)}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	layout: {
		flex: 1,
	},
	flex: {
		flex: 1,
	},
	container: {
		flex: 1,
		paddingHorizontal: 24,
	},
	scrollContent: {
		flexGrow: 1,
	},
	stepIndicatorRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 24,
		gap: 0,
	},
	stepDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: semanticColors.border.default,
	},
	stepDotActive: {
		backgroundColor: semanticColors.brand.primary,
	},
	stepBar: {
		width: 40,
		height: 3,
		backgroundColor: semanticColors.border.default,
		marginHorizontal: 4,
	},
	stepBarActive: {
		backgroundColor: semanticColors.brand.primary,
	},
	stepTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-Bold',
		marginBottom: 8,
	},
	stepSubtitle: {
		fontSize: 15,
		color: semanticColors.text.secondary,
		fontFamily: 'Pretendard-Regular',
		marginBottom: 32,
		lineHeight: 22,
	},
	fieldContainer: {
		marginBottom: 24,
	},
	fieldLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-SemiBold',
		marginBottom: 8,
	},
	textInput: {
		height: 52,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: semanticColors.border.default,
		backgroundColor: semanticColors.surface.background,
		paddingHorizontal: 16,
		fontSize: 16,
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-Regular',
	},
	textInputSelected: {
		borderColor: semanticColors.brand.primary,
		backgroundColor: '#FDFBFF',
	},
	selectorButton: {
		height: 52,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: semanticColors.border.default,
		backgroundColor: semanticColors.surface.background,
		paddingHorizontal: 16,
		justifyContent: 'center',
	},
	selectorButtonPressed: {
		borderColor: semanticColors.brand.primary,
	},
	selectorText: {
		fontSize: 16,
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-Regular',
	},
	selectorPlaceholder: {
		color: '#9B94AB',
	},
	registeredField: {
		height: 52,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: semanticColors.brand.primary,
		backgroundColor: '#FDFBFF',
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	registeredText: {
		fontSize: 16,
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-Medium',
		flex: 1,
	},
	registeredBadge: {
		fontSize: 13,
		color: semanticColors.brand.primary,
		fontFamily: 'Pretendard-SemiBold',
	},
	autocompleteWrapper: {
		zIndex: 10,
	},
	suggestionsContainer: {
		marginTop: 4,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: semanticColors.border.default,
		backgroundColor: semanticColors.surface.background,
		overflow: 'hidden',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 4,
		paddingVertical: 4,
	},
	suggestionItem: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginHorizontal: 4,
		marginVertical: 2,
	},
	suggestionItemPressed: {
		backgroundColor: '#F5F0FF',
	},
	suggestionName: {
		fontSize: 15,
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-Medium',
	},
	suggestionUniv: {
		fontSize: 12,
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-Regular',
		marginTop: 2,
	},
	suggestionLoading: {
		paddingVertical: 20,
		alignItems: 'center',
	},
	suggestionEmpty: {
		paddingVertical: 16,
		alignItems: 'center',
	},
	suggestionEmptyText: {
		fontSize: 14,
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-Regular',
	},
	noticeCard: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		backgroundColor: '#F5F0FF',
		borderRadius: 12,
		padding: 14,
		gap: 10,
		marginBottom: 24,
	},
	noticeTextWrapper: {
		flex: 1,
	},
	noticeText: {
		fontSize: 13,
		color: semanticColors.text.primary,
		fontFamily: 'Pretendard-Medium',
		lineHeight: 19,
	},
	noticeSubText: {
		fontSize: 12,
		color: semanticColors.text.muted,
		fontFamily: 'Pretendard-Regular',
		marginTop: 2,
		lineHeight: 17,
	},
	step2Content: {
		flex: 1,
	},
	step2ButtonArea: {
		paddingBottom: 40,
		paddingTop: 12,
	},
	bottomArea: {
		flex: 1,
		justifyContent: 'flex-end',
		paddingBottom: 40,
	},
	primaryButton: {
		backgroundColor: semanticColors.brand.primary,
		borderRadius: 12,
		height: 52,
		alignItems: 'center',
		justifyContent: 'center',
	},
	primaryButtonDisabled: {
		opacity: 0.4,
	},
	primaryButtonPressed: {
		opacity: 0.85,
	},
	primaryButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'Pretendard-SemiBold',
	},
});
