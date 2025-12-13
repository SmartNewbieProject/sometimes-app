import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { semanticColors } from '@/src/shared/constants/colors';
import { Text } from '@/src/shared/ui/text';

interface RejectedImageWrapperProps {
  isRejected: boolean;
  rejectionReason?: string | null;
  onReupload?: () => void;
  children: React.ReactNode;
}

export function RejectedImageWrapper({
  isRejected,
  rejectionReason,
  onReupload,
  children,
}: RejectedImageWrapperProps) {
  if (!isRejected) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {children}
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text
            weight="medium"
            size="xs"
            textColor="white"
            style={styles.reasonText}
          >
            {rejectionReason || '사유 미기재'}
          </Text>
          {onReupload && (
            <Pressable style={styles.reuploadButton} onPress={onReupload}>
              <Text weight="bold" size="xs" textColor="black">
                변경하기
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  reasonText: {
    textAlign: 'center',
    lineHeight: 16.8,
  },
  reuploadButton: {
    backgroundColor: semanticColors.surface.background,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
});
