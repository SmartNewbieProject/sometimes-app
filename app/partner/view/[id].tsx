import { View, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Button, PalePurpleGradient, Header, Section, ImageResource, Carousel, type CarouselRef } from '@shared/ui';
import Loading from '@features/loading';
import Match from '@features/match';
import { ImageResources, parser, tryCatch, axiosClient } from '@shared/libs';
import { ChipSelector } from '@/src/widgets';
import Instagram from '@/src/features/instagram';
import { LinearGradient } from 'expo-linear-gradient';
import { useCarousel } from '@shared/hooks/use-carousel';
import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useModal } from '@/src/shared/hooks/use-modal';
import { HttpStatusCode } from 'axios';

const { queries, ui } = Match;
const { ui: { InstagramContactButton } } = Instagram;
const { useMatchPartnerQuery } = queries;

const useRematchingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => axiosClient.post('/matching/rematch'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latest-matching'] });
    },
  });
};

export default function PartnerDetailScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const { data: partner, isLoading, error } = useMatchPartnerQuery(matchId);
  const carouselRef = useRef<CarouselRef>(null);
  const { showErrorModal, showModal } = useModal();
  const { mutateAsync: rematch } = useRematchingMutation();

  const { flatListRef, activeIndex, activeId, setActiveIndex, next, prev, goTo } = useCarousel(
    partner?.profileImages.map(img => ({
      id: img.id,
      url: img.url,
    })) ?? []
  );

  const loading = (() => {
    if (!partner) return true;
    if (isLoading) return true;
    return false;
  })();

  const showRematchSuccessModal = () => {
    showModal({
      title: '연인 찾기 완료',
      children: '연인을 찾았어요! 바로 확인해보세요.',
      primaryButton: {
        text: '바로 확인하기',
        onClick: () => router.back(),
      },
    });
  };

  const showTicketPurchaseModal = () => {
    showModal({
      title: '연인 매칭권이 없어요',
      children: (
        <View className="flex flex-col">
          <Text>연인매칭권이 부족해 즉시 매칭을 수행할 수 없어요</Text>
          <Text>매칭권을 구매하시겠어요?</Text>
        </View>
      ),
      primaryButton: {
        text: '살펴보러가기',
        onClick: () => {
          router.navigate('/purchase/tickets/rematch');
        },
      },
      secondaryButton: {
        text: '다음에 볼게요',
        onClick: () => {},
      },
    });
  };

  const performRematch = async () => {
    await tryCatch(
      async () => {
        await rematch();
        showRematchSuccessModal();
      },
      (err) => {
        if (err.status === HttpStatusCode.Forbidden) {
          showTicketPurchaseModal();
          return;
        }
        showErrorModal(err.error, 'error');
      },
    );
  };

  const showRematchConfirmModal = () => {
    showModal({
      children: (
        <View className="w-full justify-center items-center">
          <Text textColor="black" size="md">
            재매칭권을 사용하시겠습니까?
          </Text>
        </View>
      ),
      primaryButton: {
        text: '사용하기',
        onClick: performRematch,
      },
      secondaryButton: {
        text: '나중에',
        onClick: () => {},
      },
    });
  };

  const onRematch = async () => {
    await tryCatch(
      async () => {
        showRematchConfirmModal();
      },
      (err) => {
        if (err.status === HttpStatusCode.Forbidden) {
          showErrorModal('재매칭권이 없습니다.', 'announcement');
          return;
        }
        showErrorModal(err.error, 'error');
      },
    );
  };


  const preferenceOptions = parser.getMultiplePreferenceOptions(
    ['성격 유형', '연애 스타일', '관심사', '라이프스타일'],
    partner?.preferences ?? []
  );

  const personal = preferenceOptions['성격 유형'];
  const loveStyles = preferenceOptions['연애 스타일'];
  const interests = preferenceOptions.관심사;


  if (loading || !partner) {
    return <Loading.Page title="파트너 정보를 불러오고 있어요" />;
  }

  return (
    <View className="flex-1">
      <PalePurpleGradient />

      <Header.Container>
        <Header.LeftContent>
          <Header.LeftButton onPress={router.back} visible />
        </Header.LeftContent>
      </Header.Container>

      <ScrollView className="flex-1 px-4">
        <View className="w-full flex justify-center items-center">

        <View style={styles.outerContainer}>
          <LinearGradient
            colors={['#F3EDFF', '#9747FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <Carousel
              ref={carouselRef}
              flatListRef={flatListRef}
              // images={mockImages.map(img => img.url)}
              images={partner.profileImages.map(img => img.url)}
              height={255}
              width={255}
              onIndexChange={setActiveIndex}
              autoPlay
              autoPlayInterval={3000}
            />
            {/* Shadow gradient inside the container to avoid covering the border */}

          </LinearGradient>

          <View style={styles.textContainer}>
            <Text textColor="white" weight="semibold" className="text-[20px]">
              만 {partner.age}세
            </Text>
            <View className="flex flex-row items-center">
              <Text textColor="white" weight="light" size="sm">
                #{partner.mbti}
                &nbsp;#{partner.universityDetails?.name || ''}
              </Text>
                {/* &nbsp;<UniversityBadge authenticated={profile.authenticated} /> */}
              </View>
            </View>

          <View style={styles.paperPlane}>
            <ImageResource
              resource={ImageResources.PAPER_PLANE_WITHOUT_BG}
              width={76}
              height={76}
            />
          </View>
          <View style={styles.heart}>
            <ImageResource
              resource={ImageResources.HEART}
              width={64}
              height={64}
            />
          </View>
        </View>

        <View className="flex flex-row justify-center items-center mt-3 mb-1">
          {partner.profileImages.map((img, key) => (
            <View
              key={img.id}
              style={{
                width: 8,
                height: 8,
                borderRadius: 7,
                marginHorizontal: 3,
                backgroundColor: key === activeIndex ? '#9747FF' : '#E5DEFF',
              }}
            />
          ))}
        </View>

        </View>

        <View className="flex flex-col gap-y-[30px] mt-[24px] mb-[48px]">
          <Section.Container title="기본 정보">
            <Section.Profile title="성별">
              <Text size="md">{parser.gender(partner.gender)}</Text>
            </Section.Profile>
            <Section.Profile title="선호 나이대">
              <Text size="md">{parser.getSingleOption('선호 나이대', partner.preferences) ?? "상관없음"}</Text>
            </Section.Profile>
          </Section.Container>

          <Section.Container title="연애 성향">
            <Section.Profile title="음주">
              <Text size="md">{parser.getSingleOption('음주 선호도', partner.preferences) ?? "상관없음"}</Text>
            </Section.Profile>
            <Section.Profile title="흡연">
              <Text size="md">{parser.getSingleOption('흡연 선호도', partner.preferences) ?? "상관없음"}</Text>
            </Section.Profile>
            <Section.Profile title="문신">
              <Text size="md">{parser.getSingleOption('문신 선호도', partner.preferences) ?? "상관없음"}</Text>
            </Section.Profile>

            <View className="flex flex-col w-full">
              <Text size="md" textColor="black" className="mb-[10px]">연애 스타일</Text>
              <ChipSelector
                value={[]}
                options={loveStyles}
                className="w-full"
                onChange={() => { }}
              />
            </View>
          </Section.Container>

          <Section.Container title="성격/기질">
            <Section.Profile title="MBTI">
              <Text size="md">{partner.mbti}</Text>
            </Section.Profile>
            <View className="flex flex-col w-full">
              <Text size="md" textColor="black" className="mb-[10px]">성격 유형</Text>
              <ChipSelector
                value={[]}
                options={personal}
                className="w-full"
                onChange={() => { }}
              />
            </View>
          </Section.Container>

          <Section.Container title="라이프스타일">
            <View className="flex flex-col w-full">
              <ChipSelector
                value={[]}
                options={interests}
                className="w-full"
                onChange={() => { }}
              />
            </View>
          </Section.Container>
        </View>

      </ScrollView>

      <View style={{
        marginBottom: 36,
        height: 48,
        marginLeft: 16,
        marginRight: 16,
      }}>
        <InstagramContactButton instagramId={partner.instagramId} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: 255,
    height: 255,
    position: 'relative',
  },
  gradientBorder: {
    borderRadius: 20,
    padding: 5,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  container: {
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    position: 'absolute',
    display: 'flex',
    flexDirection: "column",
    left: 14,
    bottom: 28,
    zIndex: 10,
  },
  paperPlane: {
    position: 'absolute',
    right: -42,
    bottom: 16,
  },
  heart: {
    position: 'absolute',
    left: -44,
    top: 16,
    zIndex: -1,
  }
});
