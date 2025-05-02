import { View, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import Signup from '@features/signup';
import Event from '@features/event';
import { platform } from '@shared/libs/platform';
import { cn } from '@shared/libs/cn';
import { IconWrapper } from "@/src/shared/ui/icons";
import SmallTitle from '@/assets/icons/small-title.svg';
import { useEffect, useState, useRef } from 'react';
import { Button, PalePurpleGradient, Text } from '@shared/ui';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate
} from 'react-native-reanimated';
import { Slide } from '@/src/widgets';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// 이미지 경로 직접 지정 (절대 경로)
const initialCampusCard = require('../../assets/images/initial_campus_card.png');
const initialMatchingCard = require('../../assets/images/initial_matching_card.png');
const switchMatchingCard = require('../../assets/images/switch_matching_card.png');
const switchCampusCard = require('../../assets/images/switch_campus_card.png');
const initialParticipantCard = require('../../assets/images/initial_participant_card.png');
const switchParticipantCard = require('../../assets/images/switch_participant_card.png');
const preSignupCharacter = require('../../assets/images/pre-signup-character.png');

const { useSignupProgress } = Signup;
const { hooks: { useEventAnalytics } } = Event;

interface FlippableCardProps {
  initialImage: any; // 이미지 리소스
  switchImage: any; // 이미지 리소스
  onPress?: () => void;
}

// 카드 컴포넌트
const FlippableCard: React.FC<FlippableCardProps> = ({ initialImage, switchImage, onPress }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // 애니메이션 값
  const rotation = useSharedValue(0);

  // 카드 뒤집기 애니메이션
  const flipCard = () => {
    // 애니메이션 실행
    rotation.value = withSpring(isFlipped ? 0 : 180, {
      damping: 15,
      stiffness: 100
    });

    // 상태 업데이트
    setIsFlipped(!isFlipped);
    onPress && onPress();
  };

  // 3초마다 자동으로 카드 뒤집기
  useEffect(() => {
    const interval = setInterval(() => {
      flipCard();
    }, 3000);

    // 컴포넌트가 언마운트될 때 인터벌 정리
    return () => clearInterval(interval);
  }, [isFlipped]);

  // 앞면 애니메이션 스타일
  const frontAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotation.value}deg` },
        { scale: interpolate(
            rotation.value,
            [0, 90, 180],
            [1, 0.9, 1]
          )
        }
      ],
      opacity: interpolate(
        rotation.value,
        [0, 90, 91, 180],
        [1, 0, 0, 0]
      ),
      zIndex: rotation.value < 90 ? 1 : 0,
    };
  });

  // 뒷면 애니메이션 스타일
  const backAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotation.value + 180}deg` },
        { scale: interpolate(
            rotation.value,
            [0, 90, 180],
            [1, 0.9, 1]
          )
        }
      ],
      opacity: interpolate(
        rotation.value,
        [0, 89, 90, 180],
        [0, 0, 1, 1]
      ),
      zIndex: rotation.value >= 90 ? 1 : 0,
    };
  });

  // 카드 스타일: 부모 컨테이너의 크기에 맞춤
  // 부모 컨테이너에서 aspectRatio로 비율 관리

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={flipCard}
      className="w-full h-full"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <View className="relative w-full h-full overflow-visible">
        {/* 앞면 */}
        <Animated.View
          className="absolute w-full h-full rounded-xl overflow-hidden"
          style={[
            {
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#f0f0f0',
            },
            frontAnimatedStyle
          ]}
        >
          <Image
            source={initialImage}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </Animated.View>

        {/* 뒷면 */}
        <Animated.View
          className="absolute w-full h-full rounded-xl overflow-hidden"
          style={[
            {
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#f0f0f0',
            },
            backAnimatedStyle
          ]}
        >
          <Image
            source={switchImage}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

export default function PreSignupScreen() {
  const { clear } = useSignupProgress();
  const { trackEventAction } = useEventAnalytics('pre-signup');

  // 카드 섹션 애니메이션을 위한 값
  const cardSectionOpacity = useSharedValue(0);
  const cardSectionTranslateY = useSharedValue(50);

  // 캐릭터 이미지 애니메이션을 위한 값
  const characterOpacity = useSharedValue(1);

  // 현재 활성화된 슬라이드 인덱스
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // 카드 데이터 (3장만 사용)
  const cards = [
    { initialImage: initialCampusCard, switchImage: switchCampusCard, eventName: 'campus_card_flip', id: 0 },
    { initialImage: initialMatchingCard, switchImage: switchMatchingCard, eventName: 'matching_card_flip', id: 1 },
    { initialImage: initialParticipantCard, switchImage: switchParticipantCard, eventName: 'participant_card_flip', id: 2 }
  ];

  // 카드 크기는 이제 CSS로 처리 (width: '100%', maxWidth: 250)

  // 캐릭터 이미지 크기는 이제 CSS로 처리 (w-full + maxWidth + aspectRatio)

  // 카드 섹션 애니메이션 스타일
  const cardSectionStyle = useAnimatedStyle(() => {
    return {
      opacity: cardSectionOpacity.value,
      transform: [{ translateY: cardSectionTranslateY.value }],
      position: 'absolute',
      top: 0, // 캐릭터 이미지 위에 위치하도록 조정
      left: 0,
      right: 0,
      zIndex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: '100%',
    };
  });

  // 캐릭터 이미지 애니메이션 스타일
  const characterStyle = useAnimatedStyle(() => {
    return {
      opacity: characterOpacity.value,
    };
  });

  // 초기 위치 설정
  useEffect(() => {
    // 1초 후에 카드 섹션 애니메이션 시작
    setTimeout(() => {
      cardSectionOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
      cardSectionTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    }, 1000);
  }, []);

  useEffect(() => {
    clear();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, height: "100%" }}
      >
      <PalePurpleGradient />
      <View className="flex-1">
        <View className={cn(
          "flex-1 flex-col px-4 overflow-visible",
          platform({
            ios: () => "pt-[50px]",
            android: () => "pt-[50px]",
            web: () => "pt-[40px]",
          })
        )}>
          {/* 상단 섹션 (위쪽에 배치) */}
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 items-center ">
              {/* 상단 제목 */}
              <View className="mb-2">
                <Text
                  weight="light"
                  size="sm"
                  className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A3EA1] to-[#9D6FFF] whitespace-nowrap"
                >
                  내 이상형을 찾는 가장 빠른 방법
                </Text>
              </View>

              {/* 로고 */}
              <View className="mb-2">
                <IconWrapper width={200} className="text-primaryPurple">
                  <SmallTitle />
                </IconWrapper>
              </View>
            </View>
          </View>

          {/* 메인 컨텐츠 (아래쪽에 배치) */}
          <View className="flex-1 justify-start items-center overflow-visible relative">
            {/* 캐릭터 이미지 */}
            <Animated.View className="w-full flex items-center justify-center" style={characterStyle}>
              <View style={{
                width: '100%',
                maxWidth: 400, // Maximum width constraint
                aspectRatio: 1/1.125, // Maintain aspect ratio
                overflow: 'hidden'
              }}>
                <Image
                  source={preSignupCharacter}
                  style={{
                    width: '100%',
                    height: '100%'
                  }}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>

            {/* 카드 섹션 - Slide 컴포넌트 사용 */}
            <Animated.View className="w-full h-[500px] relative overflow-visible" style={cardSectionStyle}>
              <Slide
                autoPlay={false}
                showIndicator={false}
                className="w-full h-full"
                animationType="slide"
                animationDuration={400}
                loop={true}
                onSlideChange={(index) => {
                  // 현재 활성화된 슬라이드 인덱스 업데이트
                  setActiveSlideIndex(index);
                  console.log(`슬라이드 변경: ${index}`);
                  // 이벤트 트래킹
                  trackEventAction(cards[index].eventName);
                }}
              >
                {cards.map((card, index) => (
                  <View key={index} className="w-full h-full flex items-center justify-center px-4">
                    <View
                      style={{
                        width: '70%', // 화면 너비의 70%
                        maxWidth: 321, // 최대 너비 제한
                        aspectRatio: 321/600, // 기본 레이아웃 비율 유지
                        borderRadius: 12,
                        overflow: 'visible',
                        marginBottom: 20, // 하단 여백
                      }}
                    >
                      <FlippableCard
                        initialImage={card.initialImage}
                        switchImage={card.switchImage}
                        onPress={() => {
                          // 카드를 탭하면 뒤집기만 함 (위치 이동 없음)
                          trackEventAction(cards[index].eventName);
                        }}
                      />
                    </View>
                  </View>
                ))}
              </Slide>
            </Animated.View>
          </View>
          {/* 슬라이드 인디케이터 (별도로 추가) */}
          <View className="w-full flex-row justify-center my-2">
            {cards.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${index === activeSlideIndex ? 'bg-primaryPurple' : 'bg-lightPurple'}`}
              />
            ))}
          </View>
        </View>

        {/* 하단 버튼 */}
        <View className="w-full px-4 mb-3">
          <Button
            variant="primary"
            size="md"
            className="w-full py-3 rounded-full"
            onPress={() => {
              trackEventAction('signup_button_click');
              router.navigate('/auth/signup/terms');
            }}
          >
            빠르게 사전 가입하기
          </Button>
          <Button
            variant="outline"
            size="md"
            className="w-full py-3 rounded-full mt-3 bg-[#E2D9FF] border-[#E2D9FF]"
            onPress={() => {
              trackEventAction('login_button_click');
              router.navigate('/auth/login');
            }}
          >
            <Text
              weight="medium"
              size="md"
              className="text-center text-white"
            >
              로그인하기
            </Text>
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

// 스타일 제거 - 더 이상 필요하지 않음
