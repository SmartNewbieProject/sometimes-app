import { View, TouchableOpacity } from 'react-native';
import { Text } from '../../shared/ui/text';
import { Check } from '../../shared/ui/check';
import { cn } from '@/src/shared/libs/cn';
import * as Linking from 'expo-linking';

type CheckLabelProps = {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  link?: string;
  linkText?: string;
  variant?: 'box' | 'symbol';
  className?: string;
};

export const CheckboxLabel = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  link,
  linkText = '보기',
  variant = 'box',
  className = '',
}: CheckLabelProps) => {
  const CheckComponent = variant === 'box' ? Check.Box : Check.Symbol;

  return (
    <View className={cn("flex-row items-center gap-x-2", className)}>
      <CheckComponent
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <TouchableOpacity 
        activeOpacity={0.8}
        disabled={disabled}
        onPress={() => onChange?.(!checked)}
        className="flex-1 flex-row items-center justify-between"
      >
        <Text 
          size="md" 
          className={cn(
            "text-gray-700",
            disabled && "text-gray-400"
          )}
        >
          {label}
        </Text>
        {link && (
          <TouchableOpacity onPress={() => Linking.openURL(link)}>
            <Text size="sm" className="underline" textColor="pale-purple">
              {linkText}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
}; 