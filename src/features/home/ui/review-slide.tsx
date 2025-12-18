import { UniversityName, getUnivLogo } from "@/src/shared/libs";
import Slide from "@/src/widgets/slide";
import { Text } from "@shared/ui";
import { Image, StyleSheet, View } from "react-native";
import i18n from "@/src/shared/libs/i18n";
import colors from "@/src/shared/constants/colors";

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
      autoPlay
      style={styles.slider}
      indicatorContainerStyle={styles.indicatorContainer}
    >
      {reviews.map((review) => (
        <View key={review.name} style={styles.reviewCard}>
          <View style={styles.headerRow}>
            <Image
              source={{ uri: review.universityImageUrl }}
              style={styles.universityImage}
            />
            <View style={styles.userInfo}>
              <Text size="md" weight="semibold" textColor="black">
                {review.name}
              </Text>
              <Text size="md" weight="light" textColor="black">
                {review.universityName}
              </Text>
            </View>
          </View>

          <View style={styles.contentSection}>
            <Text size="sm" textColor="black">
              {review.content}
            </Text>

            <Text size="sm" style={styles.dateText}>
              {review.date}
            </Text>
          </View>
        </View>
      ))}
    </Slide>
  );
};

const styles = StyleSheet.create({
  slider: {
    width: "100%",
  },
  indicatorContainer: {
    bottom: -28,
  },
  reviewCard: {
    flexDirection: "column",
    gap: 8,
    width: "100%",
    backgroundColor: colors.moreLightPurple,
    padding: 10,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: "row",
    gap: 8,
  },
  universityImage: {
    width: 60,
    height: 60,
  },
  userInfo: {
    flexDirection: "column",
    alignSelf: "flex-end",
    gap: 4,
  },
  contentSection: {
    marginHorizontal: 8,
    marginTop: 8,
    flexDirection: "column",
    marginLeft: 8,
  },
  dateText: {
    color: "#6F6F6F",
    marginTop: 8,
    marginBottom: 12,
  },
});

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
