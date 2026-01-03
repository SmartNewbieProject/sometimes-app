import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Linking, Image, Pressable, Platform } from 'react-native';
import { Text } from '@/src/shared/ui';
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';
import {
  getIOSStoreUrl,
  getAndroidStoreUrl,
} from '@/src/shared/libs/platform-utils';
import { useTranslation } from 'react-i18next';
import type { AppInstallPromptVariant } from '../types';

const KEYFRAMES_ID = 'app-install-prompt-animations';
const injectWebAnimations = () => {
  if (Platform.OS !== 'web') return;
  if (document.getElementById(KEYFRAMES_ID)) return;

  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes fadeSlideIn {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.2);
      }
    }
  `;
  document.head.appendChild(style);
};

interface AppInstallPromptContentProps {
  variant: AppInstallPromptVariant;
  onInstallPress?: (store: 'ios' | 'android') => void;
  onDismiss?: () => void;
}

const BENEFIT_ICONS = ['💜', '🔒', '✨'];

const StoreBadge: React.FC<{
  source: any;
  onPress: () => void;
  animationDelay: string;
}> = ({ source, onPress, animationDelay }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <View
      style={[
        styles.badgeWrapper,
        // @ts-ignore - web CSS properties
        { animationDelay },
      ]}
    >
      <Pressable
        onPress={onPress}
        // @ts-ignore - web only props
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={[
          styles.badgeButton,
          isHovered && styles.badgeButtonHovered,
        ]}
      >
        <Image
          source={source}
          style={styles.badgeImage}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  );
};

export const AppInstallPromptContent: React.FC<AppInstallPromptContentProps> = ({
  variant,
  onInstallPress,
  onDismiss,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    injectWebAnimations();
  }, []);

  const title = t(`features.app-install-prompt.ui.variants.${variant}.title`);
  const subtitle = t(`features.app-install-prompt.ui.variants.${variant}.subtitle`);

  const benefits = [
    { icon: BENEFIT_ICONS[0], text: t('features.app-install-prompt.ui.benefits.realtime_notification') },
    { icon: BENEFIT_ICONS[1], text: t('features.app-install-prompt.ui.benefits.contact_block') },
    { icon: BENEFIT_ICONS[2], text: t('features.app-install-prompt.ui.benefits.more_benefits') },
  ];

  const handleIOSPress = () => {
    onInstallPress?.('ios');
    Linking.openURL(getIOSStoreUrl());
  };

  const handleAndroidPress = () => {
    onInstallPress?.('android');
    Linking.openURL(getAndroidStoreUrl());
  };

  return (
    <View style={styles.modalContainer}>
      {/* Header */}
      <View style={[styles.header, styles.fadeSlideIn]}>
        <Text size="20" weight="bold" textColor="black" style={styles.title}>
          {title}
        </Text>
      </View>

      {/* @ts-ignore - web CSS */}
      <View style={[styles.fadeSlideIn, { animationDelay: '0.1s' }]}>
        <Text size="sm" style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>

      {/* Benefits with pulse icons */}
      {/* @ts-ignore - web CSS */}
      <View style={[styles.benefitsContainer, styles.fadeSlideIn, { animationDelay: '0.2s' }]}>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitRow}>
            {/* @ts-ignore - web CSS */}
            <Text style={[styles.benefitIcon, styles.pulseIcon, { animationDelay: `${0.8 + index * 0.2}s` }]}>
              {benefit.icon}
            </Text>
            <Text size="sm" textColor="black" style={styles.benefitText}>
              {benefit.text}
            </Text>
          </View>
        ))}
      </View>

      {/* Store badges with hover effects */}
      <View style={styles.buttonContainer}>
        <StoreBadge
          source={require('@assets/images/download/appstore-hq.png')}
          onPress={handleIOSPress}
          animationDelay="0.4s"
        />
        <StoreBadge
          source={require('@assets/images/download/googleplay-hq.png')}
          onPress={handleAndroidPress}
          animationDelay="0.5s"
        />
      </View>

      {/* Dismiss button */}
      {/* @ts-ignore - web CSS */}
      <View style={[styles.dismissContainer, styles.fadeSlideIn, { animationDelay: '0.6s' }]}>
        <Text
          size="sm"
          textColor="gray"
          style={styles.dismissText}
          onPress={onDismiss}
        >
          {t('features.app-install-prompt.ui.buttons.dismiss')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 16,
    padding: 20,
    width: 300,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: semanticColors.text.muted,
    marginBottom: 20,
  },
  benefitsContainer: {
    backgroundColor: colors.cardPurple,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitIcon: {
    fontSize: 18,
  },
  benefitText: {
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
    alignItems: 'center',
  },
  badgeWrapper: {
    width: '100%',
    // @ts-ignore - web CSS
    animationName: 'fadeSlideIn',
    animationDuration: '0.4s',
    animationFillMode: 'both',
    animationTimingFunction: 'ease-out',
  },
  badgeButton: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    // @ts-ignore - web CSS
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  badgeButtonHovered: {
    // @ts-ignore - web CSS
    transform: [{ scale: 1.05 }],
    shadowColor: colors.primaryPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  badgeImage: {
    width: '100%',
    height: 48,
  },
  dismissContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  dismissText: {
    textDecorationLine: 'underline',
  },
  fadeSlideIn: {
    // @ts-ignore - web CSS
    animationName: 'fadeSlideIn',
    animationDuration: '0.4s',
    animationFillMode: 'both',
    animationTimingFunction: 'ease-out',
  },
  pulseIcon: {
    // @ts-ignore - web CSS
    animationName: 'pulse',
    animationDuration: '1.2s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    animationFillMode: 'both',
  },
});
