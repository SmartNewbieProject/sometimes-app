import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

type Props = {
	children: ReactNode;
	className?: string;
  style?: StyleProp<ViewStyle>;
};

export const DefaultLayout = ({ children, className, style }: Props) => {
	// 키보드가 나타날 때 컨텐츠가 더 많이 위로 이동하도록 offset 설정
	const keyboardVerticalOffset = Platform.OS === 'ios' ? 100 : 20;

	return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={[styles.container, style]}
      className={className}
    >
      {children}
    </KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'column',
	},
});
