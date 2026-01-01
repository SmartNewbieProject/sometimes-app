import BottomArrowIcon from '@assets/icons/bottom-arrow.svg';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { BottomSheetPicker } from '@/src/shared/ui/bottom-sheet-picker';
import type { BottomSheetPickerOption } from '@/src/shared/ui/bottom-sheet-picker';
import { Text } from '@/src/shared/ui/text';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSignupProgress } from '../../hooks';
import i18n from '@/src/shared/libs/i18n';

const MIN_TOUCH_TARGET = 48;

function StudentIdSelector() {
  const { t } = useTranslation();
  const {
    form: { studentNumber, grade },
    updateForm,
  } = useSignupProgress();

  const [isVisible, setIsVisible] = useState(false);

  const studentIdOptions: BottomSheetPickerOption[] = useMemo(() => {
    const locale = i18n.language;

    // 일본 로케일인 경우
    if (locale.startsWith('ja')) {
      return [
        { label: '25年', value: '25年' },
        { label: '24年', value: '24年' },
        { label: '23年', value: '23年' },
        { label: '22年', value: '22年' },
        { label: '21年', value: '21年' },
        { label: '20年', value: '20年' },
        { label: '19年', value: '19年' },
      ];
    }

    // 한국: 기존 로직 유지
    return [
      { label: i18n.t('features.signup.ui.student_id_25'), value: i18n.t('features.signup.ui.student_id_25') },
      { label: i18n.t('features.signup.ui.student_id_24'), value: i18n.t('features.signup.ui.student_id_24') },
      { label: i18n.t('features.signup.ui.student_id_23'), value: i18n.t('features.signup.ui.student_id_23') },
      { label: i18n.t('features.signup.ui.student_id_22'), value: i18n.t('features.signup.ui.student_id_22') },
      { label: i18n.t('features.signup.ui.student_id_21'), value: i18n.t('features.signup.ui.student_id_21') },
      { label: i18n.t('features.signup.ui.student_id_20'), value: i18n.t('features.signup.ui.student_id_20') },
      { label: i18n.t('features.signup.ui.student_id_19'), value: i18n.t('features.signup.ui.student_id_19') },
    ];
  }, []);

  const handleSelect = (value: string) => {
    const yearPrefix = value.slice(0, 2);
    const yearNumber = Number.parseInt(yearPrefix, 10);
    const currentFullYear = new Date().getFullYear();
    const entryYear = 2000 + yearNumber;
    const calculatedGrade = Math.min(
      Math.max(currentFullYear - entryYear + 1, 1),
      6
    );

    updateForm({
      studentNumber: value,
      ...(grade === undefined && !Number.isNaN(calculatedGrade)
        ? { grade: `${calculatedGrade}${t('features.signup.ui.grade_suffix')}` }
        : {}),
    });
  };

  const hasValue = !!studentNumber;

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
          size="md"
          weight={hasValue ? "medium" : "light"}
          textColor={hasValue ? "primary" : "disabled"}
          style={styles.selectorText}
        >
          {studentNumber ?? t('features.signup.ui.student_id_select_placeholder')}
        </Text>
        <View style={styles.iconBox}>
          <BottomArrowIcon width={13} height={8} />
        </View>
      </Pressable>

      <BottomSheetPicker
        visible={isVisible}
        onClose={() => setIsVisible(false)}
        options={studentIdOptions}
        selectedValue={studentNumber}
        onSelect={handleSelect}
        title={t('features.signup.ui.student_id_select_placeholder')}
        searchable={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default StudentIdSelector;
