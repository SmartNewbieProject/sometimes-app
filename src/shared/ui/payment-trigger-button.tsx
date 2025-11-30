import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';
import { usePaymentFunnelTracking } from '@/src/shared/hooks/use-payment-funnel-tracking';

export interface PaymentTriggerButtonProps extends TouchableOpacityProps {
  componentName: string;  // 표준화된 컴포넌트 이름
  onPaymentClick?: () => void;  // 결제 화면으로의 네비게이션 콜백
  children: React.ReactNode;
}

/**
 * 결제 트리거용 표준화된 버튼 컴포넌트
 * 모든 결제 유입 버튼에서 이 컴포넌트를 사용하여 통합 추적
 */
export const PaymentTriggerButton: React.FC<PaymentTriggerButtonProps> = ({
  componentName,
  onPaymentClick,
  children,
  onPress,
  style,
  ...props
}) => {
  const { triggerStoreEntry } = usePaymentFunnelTracking();

  const handlePress = () => {
    // 결제 퍼널 추적 이벤트 트리거
    triggerStoreEntry(componentName);

    // 원래 onPress 핸들러 실행
    onPress?.();

    // 결제 화면으로의 네비게이션 콜백 실행
    onPaymentClick?.();

    console.log('💳 Payment trigger activated:', componentName);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={style as ViewStyle}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};