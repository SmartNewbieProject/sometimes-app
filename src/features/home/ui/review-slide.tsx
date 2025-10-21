import { UniversityName, getUnivLogo } from "@/src/shared/libs";
import Slide from "@/src/widgets/slide";
import { Text } from "@shared/ui";
import { Image, Platform, View } from "react-native";

type Review = {
  name: string;
  universityName: UniversityName;
  universityImageUrl: string;
  content: string;
  date: string;
};

interface ReviewSlideProps {
  onScrollStateChange: (bool: boolean) => void;
}

export const ReviewSlide = ({ onScrollStateChange }: ReviewSlideProps) => {
  return (
    <Slide
      autoPlayInterval={6000}
      className={"w-full"}
      autoPlay
      indicatorContainerClassName="!-bottom-[28px] "
    >
      {reviews.map((review) => (
        <View
          key={review.name}
          className="flex flex-col gap-y-2 w-full bg-moreLightPurple p-2.5 rounded-xl"
        >
          <View className="flex flex-row gap-x-2">
            <Image
              source={{ uri: review.universityImageUrl }}
              style={{ width: 60, height: 60 }}
            />
            <View className="flex flex-col self-end gap-y-1">
              <Text size="md" weight="semibold" textColor="black">
                {review.name}
              </Text>
              <Text size="md" weight="light" textColor="black">
                {review.universityName}
              </Text>
            </View>
          </View>

          <View className="mx-2 mt-2 flex flex-col ml-2">
            <Text size="sm" textColor="black">
              {review.content}
            </Text>

            <Text size="sm" className="text-[#6F6F6F] mt-2 mb-3">
              {review.date}
            </Text>
          </View>
        </View>
      ))}
    </Slide>
  );
};

const reviews: Review[] = [
  {
    name: "익명",
    universityName: UniversityName.동아대학교,
    universityImageUrl: getUnivLogo(UniversityName.동아대학교),
    content:
      "처음에는 인스타에서 광고형식으로 마주했는데요.😀 부산지역까지 확장한다는 광고에 속는 셈 치고 가입 해봤습니다! 현재는 매칭을 통해 만난 좋은 친구가 생겼고 그와 동시에 최근 매칭에서 연이 닿은 예쁜 썸녀가 한 분 생겼습니다. 다른 앱들에 비해서 현질유도와 현질의 의미가 크지 않고 현질 없이도 좋은 인연 만들 수 있는 가장 좋은 어플이라고 생각합니다! 개발자 선배님들 진심으로 존경하고 감사하고 사랑합니다!! ❤️❤️❤️",
    date: "25.08.10",
  },
  {
    name: "익명",
    universityName: UniversityName.건양대학교,
    universityImageUrl: getUnivLogo(UniversityName.건양대학교),
    content:
      "다른앱들 보면 보통 서울이나 수도권이어서 사람들이 대부분이어서 아쉬웠는데 대전에서 사람 만날 수 있어서 좋고 매주 두번씩 매칭해주니 이상형 바로 찾았다 잘생긴사람 많아서 좋아요 그리고 무엇보다 안전한 앱인거 같아요 !!",
    date: "25.08.09",
  },
  {
    name: "익명",
    universityName: UniversityName.경성대학교,
    universityImageUrl: getUnivLogo(UniversityName.경성대학교),
    content:
      "3일에 한번씩 무료 재매칭권이 있어서 저도 모르게 오후 9시가 기대되는 시간이 되었어요 아직 사람들이 이 앱을 잘 모르는것 같아 아쉽지만 주변에 이성 없는 사람들이 곧 몰려올거 같은 느낌이에요..ㅋㅋㅋ 새로운 사람들을 알게 되어 재밌습니다!! 좀 더 많은 분들이 사용하시게 되어 많은 사람들의 인연이 연결되길 바랍니당!",
    date: "25.08.08",
  },
  {
    name: "익명",
    universityName: UniversityName.한밭대학교,
    universityImageUrl: getUnivLogo(UniversityName.한밭대학교),
    content:
      "저는 실제로 어플을 통해서 데이트도 몇번해봐서 대학 동기들한테 마구 추천하는중입니다!... 이런 어플을 무료로 쓸 수 있다는것 만응로도 감사하네요",
    date: "25.08.07",
  },
  {
    name: "익명",
    universityName: UniversityName.경성대학교,
    universityImageUrl: getUnivLogo(UniversityName.경성대학교),
    content:
      "기존에 다른 소개팅어플은 이상형을 참고해서 해준다 하고 전혀 반영이 안되거나 아무나 막 매칭되는 경우가 많았는데 썸타임은 이상형 반영해서 ai가 매칭해주는 거라 정확성이 높은 것 같아용 더 두고 보면서 사용해볼 예정!~! 대학생끼리 하는거라 더 좋은 것 같아요🥰",
    date: "25.08.09",
  },
];
