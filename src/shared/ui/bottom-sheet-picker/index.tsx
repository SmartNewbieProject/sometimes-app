import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text as RNText,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { semanticColors } from '../../constants/semantic-colors';
import { Text } from '../text';
import SearchIcon from '@assets/icons/search.svg';
import CheckIcon from '@assets/icons/circle-check.svg';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MIN_TOUCH_TARGET = 48;
const ANIMATION_DURATION = 300;

const isWeb = Platform.OS === 'web';

// 웹: 최대 600px, 네이티브: 화면의 70%
const SHEET_HEIGHT = isWeb
  ? Math.min(600, SCREEN_HEIGHT * 0.7)
  : SCREEN_HEIGHT * 0.7;

export interface BottomSheetPickerOption {
  label: string;
  value: string;
}

export interface BottomSheetPickerProps {
  visible: boolean;
  onClose: () => void;
  options: BottomSheetPickerOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  title?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
}

function WebBottomSheetPicker({
  visible,
  onClose,
  options,
  selectedValue,
  onSelect,
  title,
  searchable = false,
  searchPlaceholder = '검색',
  emptyText = '결과가 없습니다',
  loading = false,
}: BottomSheetPickerProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [animationState, setAnimationState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed');
  const searchInputRef = useRef<TextInput>(null);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  useEffect(() => {
    if (visible && !isModalVisible) {
      setIsModalVisible(true);
      setAnimationState('opening');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationState('open');
        });
      });
    }
  }, [visible, isModalVisible]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    setAnimationState('closing');
    setTimeout(() => {
      setIsModalVisible(false);
      setAnimationState('closed');
      setSearchQuery('');
      onClose();
    }, ANIMATION_DURATION);
  }, [onClose]);

  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value);
      handleClose();
    },
    [onSelect, handleClose]
  );

  const renderItem = useCallback(
    ({ item }: { item: BottomSheetPickerOption }) => {
      const isSelected = item.value === selectedValue;
      return (
        <Pressable
          style={({ pressed }) => [
            styles.optionItem,
            isSelected && styles.optionItemSelected,
            pressed && styles.optionItemPressed,
          ]}
          onPress={() => handleSelect(item.value)}
        >
          <Text
            size="lg"
            weight={isSelected ? "semibold" : "normal"}
            textColor="primary"
            style={styles.optionText}
          >
            {item.label}
          </Text>
          {isSelected && (
            <View style={styles.checkIconWrapper}>
              <CheckIcon width={16} height={16} color={semanticColors.brand.primary} />
            </View>
          )}
        </Pressable>
      );
    },
    [selectedValue, handleSelect]
  );

  const keyExtractor = useCallback(
    (item: BottomSheetPickerOption) => item.value,
    []
  );

  if (!isModalVisible) return null;

  const isAnimating = animationState === 'opening' || animationState === 'closing';
  const isOpen = animationState === 'open';

  return (
    <Modal
      transparent
      visible={isModalVisible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View
            style={[
              styles.backdrop,
              {
                opacity: isOpen ? 1 : 0,
                transition: `opacity ${ANIMATION_DURATION}ms ease-out`,
              } as any,
            ]}
          />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 16 },
            {
              transform: isOpen ? 'translateY(0)' : `translateY(${SHEET_HEIGHT}px)`,
              transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.33, 1, 0.68, 1)`,
            } as any,
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {title && (
            <View style={styles.titleContainer}>
              <Text size="lg" weight="bold" textColor="primary" style={styles.title}>{title}</Text>
            </View>
          )}

          {searchable && (
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <SearchIcon
                  width={16}
                  height={16}
                  color={semanticColors.text.muted}
                />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={semanticColors.text.disabled}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => setSearchQuery('')}
                    style={styles.clearButton}
                  >
                    <Text size="sm" textColor="muted">✕</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text size="md" textColor="muted">로딩 중...</Text>
            </View>
          ) : filteredOptions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text size="md" textColor="muted" style={styles.emptyText}>{emptyText}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredOptions}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={5}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

function NativeBottomSheetPicker({
  visible,
  onClose,
  options,
  selectedValue,
  onSelect,
  title,
  searchable = false,
  searchPlaceholder = '검색',
  emptyText = '결과가 없습니다',
  loading = false,
}: BottomSheetPickerProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const searchInputRef = useRef<TextInput>(null);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const animateOpen = useCallback(() => {
    translateY.value = withTiming(0, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    backdropOpacity.value = withTiming(1, {
      duration: ANIMATION_DURATION,
    });
  }, [translateY, backdropOpacity]);

  const animateClose = useCallback((callback: () => void) => {
    Keyboard.dismiss();
    translateY.value = withTiming(SHEET_HEIGHT, {
      duration: ANIMATION_DURATION - 50,
      easing: Easing.in(Easing.cubic),
    });
    backdropOpacity.value = withTiming(0, {
      duration: ANIMATION_DURATION - 50,
    }, () => {
      runOnJS(callback)();
    });
  }, [translateY, backdropOpacity]);

  useEffect(() => {
    if (visible) {
      translateY.value = SHEET_HEIGHT;
      backdropOpacity.value = 0;
      setIsModalVisible(true);
      requestAnimationFrame(() => {
        animateOpen();
      });
    }
  }, [visible, animateOpen, translateY, backdropOpacity]);

  const handleClose = useCallback(() => {
    animateClose(() => {
      setIsModalVisible(false);
      setSearchQuery('');
      onClose();
    });
  }, [animateClose, onClose]);

  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value);
      handleClose();
    },
    [onSelect, handleClose]
  );

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const renderItem = useCallback(
    ({ item }: { item: BottomSheetPickerOption }) => {
      const isSelected = item.value === selectedValue;
      return (
        <Pressable
          style={({ pressed }) => [
            styles.optionItem,
            isSelected && styles.optionItemSelected,
            pressed && styles.optionItemPressed,
          ]}
          onPress={() => handleSelect(item.value)}
        >
          <Text
            size="lg"
            weight={isSelected ? "semibold" : "normal"}
            textColor="primary"
            style={styles.optionText}
          >
            {item.label}
          </Text>
          {isSelected && (
            <View style={styles.checkIconWrapper}>
              <CheckIcon width={16} height={16} color={semanticColors.brand.primary} />
            </View>
          )}
        </Pressable>
      );
    },
    [selectedValue, handleSelect]
  );

  const keyExtractor = useCallback(
    (item: BottomSheetPickerOption) => item.value,
    []
  );

  if (!isModalVisible) return null;

  return (
    <Modal
      transparent
      visible={isModalVisible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            styles.sheetNative,
            sheetStyle,
            { paddingBottom: insets.bottom + 16 },
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {title && (
            <View style={styles.titleContainer}>
              <Text size="lg" weight="bold" textColor="primary" style={styles.title}>{title}</Text>
            </View>
          )}

          {searchable && (
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <SearchIcon
                  width={16}
                  height={16}
                  color={semanticColors.text.muted}
                />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={semanticColors.text.disabled}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => setSearchQuery('')}
                    style={styles.clearButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text size="sm" textColor="muted">✕</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text size="md" textColor="muted">로딩 중...</Text>
            </View>
          ) : filteredOptions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text size="md" textColor="muted" style={styles.emptyText}>{emptyText}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredOptions}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              initialNumToRender={15}
              maxToRenderPerBatch={10}
              windowSize={5}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

export function BottomSheetPicker(props: BottomSheetPickerProps) {
  if (isWeb) {
    return <WebBottomSheetPicker {...props} />;
  }
  return <NativeBottomSheetPicker {...props} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: semanticColors.surface.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 -3px 10px rgba(0, 0, 0, 0.1)',
      } as any,
    }),
  },
  sheetNative: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: semanticColors.border.default,
    borderRadius: 2,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.smooth,
  },
  title: {
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: semanticColors.surface.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    ...Platform.select({
      web: {
        display: 'flex',
      } as any,
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Pretendard-Regular',
    color: semanticColors.text.primary,
    marginLeft: 12,
    height: 52,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  clearButton: {
    padding: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
    paddingHorizontal: 24,
    paddingVertical: 18,
    marginHorizontal: 8,
    marginVertical: 6,
    borderRadius: 14,
    backgroundColor: semanticColors.surface.background,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    ...Platform.select({
      web: {
        display: 'flex',
      } as any,
    }),
  },
  optionItemSelected: {
    backgroundColor: semanticColors.surface.tertiary,
    borderColor: semanticColors.brand.primary,
    borderWidth: 2,
  },
  optionItemPressed: {
    backgroundColor: semanticColors.surface.surface,
  },
  optionText: {
    flex: 1,
  },
  checkIconWrapper: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
  },
});
