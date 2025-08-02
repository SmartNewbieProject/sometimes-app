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
  console.log("review", reviews);
  return (
    <Slide
      autoPlayInterval={6000}
      className={`w-full ${Platform.OS === "android" ? "h-40" : ""}`}
      autoPlay
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
    universityName: UniversityName.한밭대학교,
    universityImageUrl: getUnivLogo(UniversityName.한밭대학교),
    content:
      "인스타그램을 알수없다는 점에서 좋다 연락을 편하게 할 수 있어서 좋은 것 같아요",
    date: "25.03.10",
  },
  {
    name: "익명",
    universityName: UniversityName.한밭대학교,
    universityImageUrl: getUnivLogo(UniversityName.한밭대학교),
    content:
      "소개팅… 해주시는 것만으로도 큰절 올리겠습니다. 사람 만나기가 쉽지 않더라구요ㅠㅠ",
    date: "25.03.11",
  },
  {
    name: "익명",
    universityName: UniversityName.한밭대학교,
    universityImageUrl: getUnivLogo(UniversityName.한밭대학교),
    content: "대화 너무 잘 통해서 너무 맘에 들었습니다!",
    date: "25.03.10",
  },
  {
    name: "익명",
    universityName: UniversityName.한밭대학교,
    universityImageUrl: getUnivLogo(UniversityName.한밭대학교),
    content: "이런 이벤트를 열어주셔서 감사합니다!",
    date: "25.03.10",
  },
  {
    name: "익명",
    universityName: UniversityName.한밭대학교,
    universityImageUrl: getUnivLogo(UniversityName.한밭대학교),
    content: "잘생기고 성격도 좋아요",
    date: "25.03.10",
  },
];
