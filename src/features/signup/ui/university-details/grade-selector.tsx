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

function GradeSelector() {
  const { t } = useTranslation();
  const {
    form: { grade },
    updateForm,
  } = useSignupProgress();

  const [isVisible, setIsVisible] = useState(false);

  const gradeOptions: BottomSheetPickerOption[] = useMemo(
    () => [
      { label: i18n.t('features.signup.ui.grade_1'), value: i18n.t('features.signup.ui.grade_1') },
      { label: i18n.t('features.signup.ui.grade_2'), value: i18n.t('features.signup.ui.grade_2') },
      { label: i18n.t('features.signup.ui.grade_3'), value: i18n.t('features.signup.ui.grade_3') },
      { label: i18n.t('features.signup.ui.grade_4'), value: i18n.t('features.signup.ui.grade_4') },
      { label: i18n.t('features.signup.ui.grade_5'), value: i18n.t('features.signup.ui.grade_5') },
      { label: i18n.t('features.signup.ui.grade_6'), value: i18n.t('features.signup.ui.grade_6') },
      { label: i18n.t('features.signup.ui.grade_graduated'), value: i18n.t('features.signup.ui.grade_graduated') },
    ],
    []
  );

  const handleSelect = (value: string) => {
    updateForm({ grade: value });
  };

  const hasValue = !!grade;

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
          {grade ?? t('features.signup.ui.grade_select_placeholder')}
        </Text>
        <View style={styles.iconBox}>
          <BottomArrowIcon width={13} height={8} />
        </View>
      </Pressable>

      <BottomSheetPicker
        visible={isVisible}
        onClose={() => setIsVisible(false)}
        options={gradeOptions}
        selectedValue={grade}
        onSelect={handleSelect}
        title={t('features.signup.ui.grade_select_placeholder')}
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

export default GradeSelector;
