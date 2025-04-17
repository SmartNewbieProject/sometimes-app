import { View, LayoutChangeEvent, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Image } from 'expo-image';
import { Text } from '@/src/shared/ui';
import { useAuth } from '../auth';
import { Time } from './ui';
import { useNextMatchingDate } from './queries';
import { dayUtils } from '@/src/shared/libs';
import { calculateTime } from './services/calculate-time';
import ArrowRight from '@assets/icons/right-white-arrow.svg';
import { IconWrapper } from '@/src/shared/ui/icons';

interface IdleMatchTimerProps {
  onTimeEnd?: () => void;
}

export default function IdleMatchTimer({ onTimeEnd }: IdleMatchTimerProps) {
  const [width, setWidth] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => dayUtils.create());

  const { profileDetails } = useAuth();
  const { data: day = {
    nextMatchingDate: currentTime,
  } } = useNextMatchingDate();
  const time = calculateTime(day.nextMatchingDate, currentTime);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth } = event.nativeEvent.layout;
    setWidth(layoutWidth);
  };

  const updateTime = useCallback(() => {
    if (currentTime.isSame(day.nextMatchingDate, 'second')) {
      return;
    }
    const now = dayUtils.create();
    setCurrentTime(now);
    const { shouldTriggerCallback } = calculateTime(day.nextMatchingDate, now);
    if (shouldTriggerCallback && onTimeEnd) {
      onTimeEnd();
    }
  }, [day.nextMatchingDate, onTimeEnd]);

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [updateTime]);


  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@assets/images/time-card-bg.png')}
        onLayout={onLayout}
        style={[styles.imageBackground, { height: width }]}
        resizeMode="cover"
        className="w-full flex flex-col px-[14px] py-[25px]"
      >
        <Image
          source={require('@assets/images/sandclock.png')}
          style={{ width: 72, height: 82 }}
        />

        <View className="my-[8px]">
          <Text size="md" textColor="black" weight="semibold">
            {profileDetails?.name}님
          </Text>
          <Text size="md" textColor="black" weight="semibold">
            이상형 매칭까지
          </Text>
        </View>

        <View className="flex flex-row gap-x-1 mb-[8px]">
          <Time value={time.delimeter} />
          <Time value="-" />
          {time.value?.toString().split('').map((value, index) => (
            <Time key={index} value={value} />
          ))}
        </View>

        <View>
          <Text size="md" textColor="black" weight="semibold">
            남았어요
          </Text>
          <Text size="sm" textColor="pale-purple" weight="light" className="mt-[8px]">
            매주 목·일 21시에 매칭이 시작돼요!
          </Text>
        </View>

        <View style={styles.previousContainer}>
          <View className="w-full bg-[#fcfaff] relative">
            <View style={styles.topRadius} />
          </View>
          <View className="w-full flex flex-row">
            <TouchableOpacity
              className="bg-primaryPurple flex-1 flex flex-row justify-end items-center pr-1"
              style={styles.previousButton}
            >
              <Text className="w-[24px] text-white text-[12px]">
                이전
                매칭
              </Text>
              <IconWrapper width={12} height={12}>
                <ArrowRight />
              </IconWrapper>
            </TouchableOpacity>
            <View className="w-[16px] bg-[#fcfaff] h-full" />
          </View>
          <View className="w-full bg-[#fcfaff] relative">
            <View style={styles.bottomRadius} />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  previousContainer: {
    position: 'absolute',
    width: 72,
    flexDirection: 'column',
    backgroundColor: '#ECE5FF',
    height: 128,
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
    right: 0,
    top: 0,
  },
  previousButton: {
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
    height: 112,
  },
  topRadius: {
    borderBottomRightRadius: 16,
    borderTopEndRadius: 16,
    height: 35,
    width: '100%',
    backgroundColor: '#ECE5FF',
  },
  bottomRadius: {
    borderTopEndRadius: 16,
    height: 35,
    width: '100%',
    backgroundColor: '#e6ddff',
  },
});
