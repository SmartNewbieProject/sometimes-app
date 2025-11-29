import { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import type { RefObject } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const SLIDER_WIDTH = Dimensions.get('window').width;

interface CarouselProps {
  images: string[];
  height?: number;
  width?: number;
  onIndexChange?: (index: number) => void;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  flatListRef?: RefObject<FlatList<any>>;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export interface CarouselRef {
  scrollToIndex: (index: number) => void;
}

export const Carousel = forwardRef<CarouselRef, CarouselProps>(
  ({ images, height = 300, width = SLIDER_WIDTH, onIndexChange, flatListRef, autoPlay = false, autoPlayInterval = 3000 }, ref) => {
    useImperativeHandle(ref, () => ({
      scrollToIndex: (index: number) => {
        if (flatListRef?.current) {
          flatListRef.current.scrollToIndex({ index, animated: true });
        }
      },
    }), [flatListRef]);

    const [current, setCurrent] = useState(0);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const slideSize = width;
      const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
      console.log('[Carousel] handleScroll index:', index);
      onIndexChange?.(index);
      setCurrent(index);
    };

    useEffect(() => {
      if (!autoPlay) return;
      const interval = setInterval(() => {
        setCurrent(prev => {
          const next = (prev + 1) % images.length;
          console.log('[Carousel] autoPlay scrollToIndex:', next);
          if (flatListRef?.current) {
            flatListRef.current.scrollToIndex({ index: next, animated: true });
          }
          onIndexChange?.(next);
          return next;
        });
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }, [autoPlay, autoPlayInterval, images.length, flatListRef, onIndexChange]);

    if (!images.length) return null;

    return (
      <View style={[styles.container, { height, width }]}> 
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          snapToInterval={width}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={[styles.itemContainer, { height, width }]}> 
              <Image
                source={{ uri: item }}
                style={{
                  ...styles.image,
                  width,
                  height,
                }}
                contentFit="cover"
              />
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          style={{
            margin: 8,
            borderRadius: 10,
          }}
        />
            <LinearGradient
              colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.7)']}
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                left: 0,
                right: 0,
                height: '40%',
                zIndex: 1,
              }}
            />
      </View>
    );
  }
);

Carousel.displayName = 'Carousel';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
  },
  itemContainer: {
    width: SLIDER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});