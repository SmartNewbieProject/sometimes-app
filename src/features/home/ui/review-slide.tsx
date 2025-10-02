import { UniversityName, getUnivLogo } from "@/src/shared/libs";
import Slide from "@/src/widgets/slide";
import { Text } from "@shared/ui";
import { Image, Platform, View } from "react-native";
import i18n from "@/src/shared/libs/i18n";

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
    name: i18n.t("features.home.ui.review_slide.anonymous"),
    universityName: UniversityName.동아대학교,
    universityImageUrl: getUnivLogo(UniversityName.동아대학교),
    content:
      i18n.t("features.home.ui.review_slide.review_1"),
    date: "25.08.10",
  },
  {
    name: i18n.t("features.home.ui.review_slide.anonymous"),
    universityName: UniversityName.건양대학교,
    universityImageUrl: getUnivLogo(UniversityName.건양대학교),
    content:
      i18n.t("features.home.ui.review_slide.review_2"),
    date: "25.08.09",
  },
  {
    name: i18n.t("features.home.ui.review_slide.anonymous"),
    universityName: UniversityName.경성대학교,
    universityImageUrl: getUnivLogo(UniversityName.경성대학교),
    content:
            i18n.t("features.home.ui.review_slide.review_3"),
    date: "25.08.08",
  },
  {
    name: i18n.t("features.home.ui.review_slide.anonymous"),
    universityName: UniversityName.한밭대학교,
    universityImageUrl: getUnivLogo(UniversityName.한밭대학교),
    content:
            i18n.t("features.home.ui.review_slide.review_4"),
    date: "25.08.07",
  },
  {
    name: i18n.t("features.home.ui.review_slide.anonymous"),
    universityName: UniversityName.경성대학교,
    universityImageUrl: getUnivLogo(UniversityName.경성대학교),
    content:
      i18n.t("features.home.ui.review_slide.review_5"),
    date: "25.08.09",
  },
];
