import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { semanticColors } from '../../constants/colors';

interface ActionSheetOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
  title?: string;
}

export function ActionSheet({ visible, onClose, options, title }: ActionSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
              {title && (
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{title}</Text>
                </View>
              )}
              {options.map((option, index) => (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.option,
                    index === 0 && !title && styles.firstOption,
                    index === options.length - 1 && styles.lastOption,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => {
                    option.onPress();
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      option.destructive && styles.destructiveText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.optionPressed,
                ]}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: semanticColors.surface.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  titleContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.smooth,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: semanticColors.text.muted,
    textAlign: 'center',
  },
  option: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.smooth,
  },
  firstOption: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionPressed: {
    backgroundColor: semanticColors.surface.surface,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: semanticColors.text.primary,
    textAlign: 'center',
  },
  destructiveText: {
    color: semanticColors.state.error,
  },
  cancelButton: {
    paddingVertical: 16,
    backgroundColor: semanticColors.surface.background,
    borderRadius: 12,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: semanticColors.text.primary,
    textAlign: 'center',
  },
});
