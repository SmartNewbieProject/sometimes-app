import { TouchableOpacity } from 'react-native';
import { IconWrapper } from '../icons';
import BoxChecked from '@/assets/icons/box-checked.svg';
import BoxUnchecked from '@/assets/icons/box-unchecked.svg';
import CheckChecked from '@/assets/icons/cherck-checked.svg';
import CheckUnchecked from '@/assets/icons/check-unchecked.svg';

type CheckProps = {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  size?: number;
  className?: string;
};

const Box = ({ 
  checked = false, 
  disabled = false,
  onChange,
  size = 25,
  className = '',
}: CheckProps) => {
  return (
    <TouchableOpacity 
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      className={className}
      activeOpacity={0.8}
    >
      <IconWrapper size={size}>
        {checked ? <BoxChecked /> : <BoxUnchecked />}
      </IconWrapper>
    </TouchableOpacity>
  );
};

const Symbol = ({ 
  checked = false, 
  disabled = false,
  onChange,
  size = 13,
  className = '',
}: CheckProps) => {
  return (
    <TouchableOpacity 
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      className={className}
      activeOpacity={0.8}
    >
      <IconWrapper size={size}>
        {checked ? <CheckChecked /> : <CheckUnchecked />}
      </IconWrapper>
    </TouchableOpacity>
  );
};

export const Check = {
  Box,
  Symbol,
};
