import { StyleSheet } from 'react-native';
import colors from '@/src/shared/constants/colors';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F6F6F6',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 180,
  },
  contentContainer: {
    flex: 1,
    gap: 12,
  },
  headerContainer: {
    gap: 10,
  },
  mbtiType: {
    fontSize: 25,
    fontWeight: '600',
    color: '#303030',
    lineHeight: 25 * 1.3,
  },
  infoContainer: {
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#303030',
    lineHeight: 15 * 1.3,
  },
  description: {
    fontSize: 10,
    fontWeight: '300',
    color: '#303030',
    lineHeight: 10 * 1.3,
  },
  compatibilityContainer: {
    gap: 5,
  },
  compatibilityLabel: {
    fontSize: 10,
    fontWeight: '400',
    color: colors.brand.primary,
    lineHeight: 10 * 1.2,
    textAlign: 'center',
  },
  compatibilityTagsContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  compatibilityTag: {
    backgroundColor: colors.brand.primary,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
  compatibilityTagText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 15 * 1.2,
  },
  iconContainer: {
    width: 118,
    height: 118,
    position: 'relative',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  iconBackground: {
    position: 'absolute',
    width: 118.581,
    height: 118.581,
    left: '50%',
    top: '50%',
    transform: [{ translateX: -118.581 / 2 }, { translateY: -118.581 / 2 }],
  },
});
