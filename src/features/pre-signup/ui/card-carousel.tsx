import { ImageResources } from "@/src/shared/libs/image";
import Slider from "@/src/widgets/slide";
import type React from "react";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { FlippableCard } from "./flippable-card";

interface CardCarouselProps {
  style?: any;
  onSlideChange?: (index: number) => void;
  trackEventAction?: (eventName: string) => void;
}

export const CardCarousel: React.FC<CardCarouselProps> = ({
  style,
  onSlideChange,
  trackEventAction = () => {},
}) => {
  const [isSlideScrolling, setIsSlideScrolling] = useState(false);

  const cards = [
    {
      initialImage: ImageResources.INITIAL_CAMPUS_CARD,
      switchImage: ImageResources.SWITCH_CAMPUS_CARD,
      eventName: "campus_card_flip",
      id: 0,
    },
    {
      initialImage: ImageResources.INITIAL_MATCHING_CARD,
      switchImage: ImageResources.SWITCH_MATCHING_CARD,
      eventName: "matching_card_flip",
      id: 1,
    },
    {
      initialImage: ImageResources.INITIAL_PARTICIPANT_CARD,
      switchImage: ImageResources.SWITCH_PARTICIPANT_CARD,
      eventName: "participant_card_flip",
      id: 2,
    },
  ];

  return (
    <Animated.View
      style={[styles.container, style]}
    >
      <Slider
        autoPlay={true}
        autoPlayInterval={6000}
        showIndicator={true}
        style={styles.slider}
        animationDuration={400}
        indicatorPosition="bottom"
        indicatorContainerClassName=""
        onSlideChange={(index) => {
          const safeIndex = index % cards.length;
          onSlideChange?.(safeIndex);
          trackEventAction(cards[safeIndex].eventName);
        }}
      >
        {cards.map((card, index) => (
          <View
            key={index}
            style={styles.cardContainer}
          >
            <View style={styles.cardWrapper}>
              <FlippableCard
                initialImage={card.initialImage}
                switchImage={card.switchImage}
                disableFlip={isSlideScrolling}
                onPress={() => {
                  trackEventAction(cards[index].eventName);
                }}
              />
            </View>
          </View>
        ))}
      </Slider>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 400,
    position: 'relative',
    overflow: 'visible',
  },
  slider: {
    width: '100%',
    height: '100%',
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cardWrapper: {
    width: 250,
    height: 250 * 1.545,
    borderRadius: 18.34,
    overflow: 'visible',
    marginBottom: 20,
  },
});
