import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Button, PalePurpleGradient, Header, Section, ImageResource } from '@shared/ui';
import Loading from '@features/loading';
import Match from '@features/match';
import { ImageResources, parser } from '@shared/libs';
import { ChipSelector } from '@/src/widgets';
import Instagram from '@/src/features/instagram';

const { queries, ui } = Match;
const { ui: { InstagramContactButton } } = Instagram;
const { useMatchPartnerQuery } = queries;
const { PartnerImage } = ui;

export default function PartnerDetailScreen() {
  const { id: matchId } = useLocalSearchParams<{ id: string }>();
  const { data: partner, isLoading, error } = useMatchPartnerQuery(matchId);

  const loading = (() => {
    if (!partner) return true;
    if (isLoading) return true;
    return false;
  })();

  if (loading) {
    return <Loading.Page title="파트너 정보를 불러오고 있어요" />;
  }

  const p = partner!;

  const preferenceOptions = parser.getMultiplePreferenceOptions(
    ['성격 유형', '연애 스타일', '관심사', '라이프스타일'],
    p.preferences
  );

  const personal = preferenceOptions['성격 유형'];
  const loveStyles = preferenceOptions['연애 스타일'];
  const interests = preferenceOptions.관심사;

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
          <PartnerImage
            uri={p.profileImages[0].url}
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
          prefix={<ImageResource resource={ImageResources.TICKET}
            width={32}
            height={32}
          />}>
          재매칭권 사용하기
        </Button>
        <InstagramContactButton instagramId={p.instagramId} />
      </View>

    </View>
  );
}
