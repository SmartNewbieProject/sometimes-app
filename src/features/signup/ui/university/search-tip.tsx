import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { StyleSheet, Text, View } from 'react-native';
import HelpIcon from '@assets/icons/help.svg';

interface SearchTipProps {
  title: string;
  description: string;
}

export function SearchTip({ title, description }: SearchTipProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <HelpIcon width={20} height={20} color={semanticColors.brand.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: semanticColors.brand.primary,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: semanticColors.text.primary,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: semanticColors.text.secondary,
    fontFamily: 'Pretendard-Regular',
    lineHeight: 18,
  },
});
