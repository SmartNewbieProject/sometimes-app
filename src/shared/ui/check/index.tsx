import { TouchableOpacity, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { IconWrapper } from '../icons';
import BoxChecked from '@/assets/icons/box-checked.svg';
import BoxUnchecked from '@/assets/icons/box-unchecked.svg';
import CheckChecked from '@/assets/icons/cherck-checked.svg';
import CheckUnchecked from '@/assets/icons/check-unchecked.svg';
import React from 'react';
import { Show } from '../show';

type CheckProps = {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const Box = ({
  checked = false,
  disabled = false,
  onChange,
  size = 25,
  children,
  style,
}: CheckProps) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={[styles.boxContainer, style]}
      activeOpacity={0.4}
    >
      <IconWrapper size={size}>
        {checked ? <BoxChecked /> : <BoxUnchecked />}
      </IconWrapper>
      <Show when={!!children}>
        {children}
      </Show>
    </TouchableOpacity>
  );
};

const Symbol = ({
  checked = false,
  disabled = false,
  onChange,
  size = 13,
  children,
  style,
}: CheckProps) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={style}
      activeOpacity={0.8}
    >
      <IconWrapper size={size}>
        {checked ? <CheckChecked /> : <CheckUnchecked />}
      </IconWrapper>
      <Show when={!!children}>
        <View style={styles.childrenContainer}>
          {children}
        </View>
      </Show>
    </TouchableOpacity>
  );
};

export const Check = {
  Box,
  Symbol,
};

const styles = StyleSheet.create({
  boxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  childrenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
