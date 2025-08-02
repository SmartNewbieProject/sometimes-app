import { ImageResources } from "@/src/shared/libs/image";
import Slider from "@/src/widgets/slide";
import type React from "react";
import { useState } from "react";
import { View } from "react-native";
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
      className="w-full h-[400px] relative overflow-visible"
      style={style}
    >
      <Slider
        autoPlay={true}
        autoPlayInterval={6000}
        showIndicator={true}
        className="w-full h-full"
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
            className="w-full h-full flex items-center justify-center px-4"
          >
            <View
              style={{
                width: 250,
                height: 250 * 1.545,
                borderRadius: 18.34,
                overflow: "visible",
                marginBottom: 20,
              }}
            >
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
