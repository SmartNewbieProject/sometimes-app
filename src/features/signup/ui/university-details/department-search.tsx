import Loading from '@/src/features/loading';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { BottomSheetPicker } from '@/src/shared/ui/bottom-sheet-picker';
import type { BottomSheetPickerOption } from '@/src/shared/ui/bottom-sheet-picker';
import BottomArrowIcon from '@assets/icons/bottom-arrow.svg';
import { useGlobalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSignupProgress } from '../../hooks';
import { useDepartmentQuery } from '../../queries';

const MIN_TOUCH_TARGET = 48;

function DepartmentSearch() {
  const { t } = useTranslation();
  const {
    updateForm,
    form: { departmentName },
  } = useSignupProgress();

  const [isVisible, setIsVisible] = useState(false);
  const { universityId } = useGlobalSearchParams<{
    universityId: string;
  }>();
  const { data: departments = [], isLoading } = useDepartmentQuery(universityId);

  const departmentOptions: BottomSheetPickerOption[] = useMemo(
    () =>
      departments.map((dept) => ({
        label: dept,
        value: dept,
      })),
    [departments]
  );

  const handleSelect = (value: string) => {
    updateForm({ departmentName: value });
  };

  const hasValue = !!departmentName;

  if (isLoading) {
    return <Loading.Page title={t('features.signup.ui.department_search_loading')} />;
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setIsVisible(true)}
        style={({ pressed }) => [
          styles.selector,
          pressed && styles.selectorPressed,
        ]}
      >
        <Text
          style={[styles.selectorText, hasValue && styles.selectorTextSelected]}
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
    color: semanticColors.text.disabled,
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
    marginRight: 8,
  },
  selectorTextSelected: {
    color: semanticColors.text.primary,
    fontWeight: '500',
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    width: 28,
    height: 28,
    backgroundColor: semanticColors.surface.other,
  },
});

export default DepartmentSearch;
