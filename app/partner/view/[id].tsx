import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Button, PalePurpleGradient, Header, Section, ImageResource } from '@shared/ui';
import Loading from '@features/loading';
import Match from '@features/match';
import { ImageResources, parser, tryCatch, axiosClient } from '@shared/libs';
import { ChipSelector } from '@/src/widgets';
import Instagram from '@/src/features/instagram';
import { useModal } from '@/src/shared/hooks/use-modal';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/src/shared/config/query';
import { HttpStatusCode } from 'axios';

const { queries, ui } = Match;
const { ui: { InstagramContactButton } } = Instagram;
const { useMatchPartnerQuery } = queries;
const { PartnerImage } = ui;

export default function PartnerDetailScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const { data: partner, isLoading } = useMatchPartnerQuery(matchId);
  const { showModal, showErrorModal } = useModal();

  // 재매칭 API 호출을 위한 mutation 설정
  const useRematchingMutation = () =>
    useMutation({
      mutationFn: () => axiosClient.post('/matching/rematch'),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['latest-matching'] });
      },
    });

  const { mutateAsync: rematch } = useRematchingMutation();

  const loading = (() => {
    if (!partner) return true;
    if (isLoading) return true;
    return false;
  })();

  // 재매칭 성공 모달
  const showRematchSuccessModal = () => {
    showModal({
      title: "연인 찾기 완료",
      children: "연인을 찾았어요! 바로 확인해보세요.",
      primaryButton: {
        text: "바로 확인하기",
        onClick: () => {
          router.navigate('/home');
        },
      },
    });
  };

  // 티켓 구매 모달
  const showTicketPurchaseModal = () => {
    showModal({
      title: "연인 매칭권이 없어요",
      children: (
        <View className="flex flex-col">
          <Text>
            연인매칭권이 부족해 즉시 매칭을 수행할 수 없어요
          </Text>
          <Text>
            매칭권을 구매하시겠어요?
          </Text>
        </View>
      ),
      primaryButton: {
        text: "살펴보러가기",
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

  // 재매칭 실행 함수
  const performRematch = async () => {
    await tryCatch(async () => {
      await rematch();
      showRematchSuccessModal();
    }, err => {
      if (err.status === HttpStatusCode.Forbidden) {
        showTicketPurchaseModal();
        return;
      }
      showErrorModal(err.error, "error");
    });
  };

  // 재매칭 확인 모달
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
        text: "사용하기",
        onClick: performRematch,
      },
    });
  };

  // 재매칭 버튼 클릭 핸들러
  const onRematch = async () => {
    await tryCatch(async () => {
      showRematchConfirmModal();
    }, err => {
      if (err.status === HttpStatusCode.Forbidden) {
        showErrorModal("재매칭권이 없습니다.", "announcement");
        return;
      }
      showErrorModal(err.error, "error");
    });
  };

  if (loading) {
    return <Loading.Page title="파트너 정보를 불러오고 있어요" />;
  }

  const p = partner!;

  // 인스타그램 ID 디버깅
  console.log('파트너 인스타그램 ID:', p.instagramId);

  const preferenceOptions = parser.getMultiplePreferenceOptions(
    ['성격 유형', '연애 스타일', '관심사', '라이프스타일'],
    p.preferences
  );

  const personal = preferenceOptions['성격 유형'];
  const loveStyles = preferenceOptions['연애 스타일'];
  const interests = preferenceOptions['관심사'];

  return (
    <View className="flex-1">
      <PalePurpleGradient />

      <Header.Container>
        <Header.LeftContent>
          <Header.LeftButton onPress={router.back} visible />
        </Header.LeftContent>
        <Header.CenterContent>
          <Text weight="semibold" textColor="black" className="mr-8 text-[19px]">{p.name}</Text>
        </Header.CenterContent>
      </Header.Container>

      <ScrollView className="flex-1 px-4">
        <View className="w-full flex justify-center items-center">
          <PartnerImage
            uri={p.profileImages && p.profileImages.length > 0 && p.profileImages[0].url
              ? p.profileImages[0].url
              : ImageResources.TIME_CARD_BG}
            profile={{
              age: p.age,
              universityName: p.universityDetails?.name || '',
              authenticated: p.universityDetails?.authentication || false,
              mbti: p.mbti,
              name: p.name,
            }}
          />
        </View>

        <View className="flex flex-col gap-y-[30px] mt-[24px] mb-[48px]">
          <Section.Container title="기본 정보">
            <Section.Profile title="성별">
              <Text size="md">{parser.gender(p.gender)}</Text>
            </Section.Profile>
            <Section.Profile title="선호 나이대">
              <Text size="md">{parser.getSingleOption('선호 나이대', p.preferences) ?? "상관없음"}</Text>
            </Section.Profile>
          </Section.Container>

          <Section.Container title="연애 성향">
            <Section.Profile title="음주">
              <Text size="md">{parser.getSingleOption('음주 선호도', p.preferences) ?? "상관없음"}</Text>
            </Section.Profile>
            <Section.Profile title="흡연">
              <Text size="md">{parser.getSingleOption('흡연 선호도', p.preferences) ?? "상관없음"}</Text>
            </Section.Profile>
            <Section.Profile title="문신">
              <Text size="md">{parser.getSingleOption('문신 선호도', p.preferences) ?? "상관없음"}</Text>
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
              <Text size="md">{p.mbti}</Text>
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

      <View className="flex flex-col md:flex-row gap-x-4 gap-y-2 mb-4 md:mb-12 px-4">
        <Button
          className="flex-1 w-full"
          onPress={onRematch}
          prefix={<ImageResource resource={ImageResources.TICKET}
            width={32}
            height={32}
          />}>
          재매칭권 사용하기
        </Button>
        <InstagramContactButton instagramId={p.instagramId || ''} />
      </View>

    </View>
  );
}
