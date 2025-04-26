import { View, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, Button, PalePurpleGradient, Header } from '@/src/shared/ui';
import { useState, useEffect } from 'react';
import { tryCatch } from '@/src/shared/libs';
import Loading from '@/src/features/loading';
import { useModal } from '@/src/shared/hooks/use-modal';

// 파트너 정보 타입 정의
interface PartnerInfo {
  id: string;
  name: string;
  age: number;
  university: string;
  department: string;
  profileImage: string;
  interests: string[];
  introduction: string;
  // 필요한 추가 필드들
}

export default function PartnerDetailScreen() {
  // URL 파라미터에서 id 가져오기
  const { id } = useLocalSearchParams<{ id: string }>();
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showErrorModal } = useModal();

  useEffect(() => {
    // 파트너 정보 가져오기
    const fetchPartnerInfo = async () => {
      setIsLoading(true);

      await tryCatch(async () => {
        // 실제 API 호출로 대체해야 합니다
        // const response = await axiosClient.get(`/partners/${id}`);
        // setPartner(response.data);

        // 임시 데이터 (API 연동 전까지 사용)
        setTimeout(() => {
          setPartner({
            id: id as string,
            name: '김소연',
            age: 23,
            university: '서울대학교',
            department: '컴퓨터공학과',
            profileImage: 'https://via.placeholder.com/300',
            interests: ['영화', '여행', '독서'],
            introduction: '안녕하세요! 저는 컴퓨터공학을 전공하고 있는 김소연입니다. 영화 보는 것을 좋아하고, 여행 다니는 것을 즐깁니다. 함께 이야기 나눌 수 있는 친구를 찾고 있어요.',
          });
          setIsLoading(false);
        }, 1000);
      }, (error) => {
        showErrorModal('파트너 정보를 불러오는데 실패했습니다.', 'error');
        setIsLoading(false);
        console.error('Failed to fetch partner info:', error);
      });
    };

    if (id) {
      fetchPartnerInfo();
    }
  }, [id]);

  if (isLoading) {
    return <Loading.Page title="파트너 정보를 불러오고 있어요" />;
  }

  if (!partner) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>파트너 정보를 찾을 수 없습니다.</Text>
        <Button className="mt-4" onPress={() => router.back()}>
          뒤로 가기
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <PalePurpleGradient />

      <Header.Container>
        <Header.LeftContent>
          <Header.LeftButton onPress={router.back} visible />
        </Header.LeftContent>
        <Header.CenterContent>
          <Text weight="semibold" size="lg">파트너 정보</Text>
        </Header.CenterContent>
      </Header.Container>

      <ScrollView className="flex-1 px-4">
        <View className="items-center my-6">
          <Image
            source={{ uri: partner.profileImage }}
            style={{ width: 150, height: 150, borderRadius: 75 }}
          />
          <Text weight="semibold" size="lg" className="mt-4">
            {partner.name}, {partner.age}
          </Text>
          <Text size="md" textColor="pale-purple" className="mt-1">
            {partner.university} {partner.department}
          </Text>
        </View>

        <View className="mb-6">
          <Text weight="semibold" size="lg" className="mb-2">관심사</Text>
          <View className="flex-row flex-wrap">
            {partner.interests.map((interest, index) => (
              <View key={index} className="bg-lightPurple rounded-full px-3 py-1 mr-2 mb-2">
                <Text size="sm" textColor="purple">{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mb-6">
          <Text weight="semibold" size="lg" className="mb-2">소개</Text>
          <Text size="md" className="leading-6">
            {partner.introduction}
          </Text>
        </View>

        <View className="flex-row justify-center mb-8">
          <Button
            variant="primary"
            className="w-full"
            onPress={() => {
              // 매칭 요청 또는 채팅 시작 등의 기능 구현
              showErrorModal('준비 중인 기능입니다.', 'announcement');
            }}
          >
            매칭 요청하기
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
