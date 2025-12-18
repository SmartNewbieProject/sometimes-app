import { View, TouchableOpacity, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { Text } from '../../shared/ui/text';
import { Check } from '../../shared/ui/check';
import * as Linking from 'expo-linking';
import i18n from '@/src/shared/libs/i18n';
import { semanticColors } from '@/src/shared/constants/semantic-colors';

type CheckLabelProps = {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  link?: string;
  linkText?: string;
  variant?: 'box' | 'symbol';
  style?: StyleProp<ViewStyle>;
};

export const CheckboxLabel = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  link,
  linkText = i18n.t("widgets.checkbox-label.checkbox_label.view_link"),
  variant = 'box',
  style,
}: CheckLabelProps) => {
  const CheckComponent = variant === 'box' ? Check.Box : Check.Symbol;

  return (
    <View style={[styles.container, style]}>
      <CheckComponent
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={() => onChange?.(!checked)}
        style={styles.labelContainer}
      >
        <Text
          size="md"
          style={[styles.labelText, disabled && styles.disabledText]}
        >
          {label}
        </Text>
        {link && (
          <TouchableOpacity onPress={() => Linking.openURL(link)}>
            <Text size="sm" style={styles.linkText} textColor="pale-purple">
              {linkText}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelText: {
    color: '#374151',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  linkText: {
    textDecorationLine: 'underline',
  },
});
