import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../../shared/ui/text';
import { Check } from '../../shared/ui/check';
import * as Linking from 'expo-linking';

type CheckLabelProps = {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  link?: string;
  linkText?: string;
  variant?: 'box' | 'symbol';
};

export const CheckboxLabel = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  link,
  linkText = '보기',
  variant = 'box',
}: CheckLabelProps) => {
  const CheckComponent = variant === 'box' ? Check.Box : Check.Symbol;

  return (
    <View style={styles.container}>
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
          style={[styles.label, disabled && styles.disabledLabel]}
        >
          {label}
        </Text>
        {link && (
          <TouchableOpacity onPress={() => Linking.openURL(link)}>
            <Text size="sm" textColor="pale-purple">
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
  label: {
    color: '#374151',
  },
  disabledLabel: {
    color: '#9CA3AF',
  },
}); 