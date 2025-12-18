import { PalePurpleGradient } from "@/src/shared/ui";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
} from "react-native";
import { IconWrapper } from "@/src/shared/ui/icons";
import VectorIcon from "@/assets/icons/Vector.svg";
import NotiPreView from "@/src/features/community/ui/home/notice";
import HotPreView from "@/src/features/community/ui/home/hot";
import { useCategory } from "@/src/features/community/hooks";
import {
  NOTICE_CODE,
  HOT_CODE,
} from "@/src/features/community/queries/use-home";

export default function CommuHome() {
  const { changeCategory } = useCategory();

  return (
    <View style={styles.container}>
      <PalePurpleGradient />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.sectionHeader}>
          <TouchableOpacity
            style={styles.sectionTitleRow}
            onPress={() => changeCategory(NOTICE_CODE)}
            accessibilityRole="button"
          >
            <Image
              source={require("@/assets/images/loudspeaker.png")}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>
              공지사항
            </Text>
            <View style={styles.mlAuto}>
              <IconWrapper>
                <VectorIcon width={9} height={24} style={styles.arrowIcon} color="black" />
              </IconWrapper>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              "https://ruby-composer-6d2.notion.site/FAQ-1ff1bbec5ba1803bab5cfbe635bba220?source=copy_link"
            )
          }
          style={styles.faqButton}
          activeOpacity={0.8}
        >
          <Image
            source={require("@/assets/images/loudspeaker.png")}
            style={styles.faqIcon}
          />
          <Text style={styles.faqText}>
            [FAQ] 자주묻는 질문
          </Text>

          <View style={styles.mlAuto}>
            <IconWrapper>
              <VectorIcon width={9} height={12} color="black" />
            </IconWrapper>
          </View>
        </TouchableOpacity>

        <View style={styles.noticeContainer}>
          <NotiPreView pageSize={5} />
        </View>

        <View style={styles.sectionHeaderHot}>
          <TouchableOpacity
            style={styles.sectionTitleRow}
            onPress={() => changeCategory(HOT_CODE)}
            accessibilityRole="button"
          >
            <Image
              source={require("@/assets/images/fireIcon.png")}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>
              인기
            </Text>
            <View style={styles.mlAuto}>
              <IconWrapper>
                <VectorIcon width={9} height={24} style={styles.arrowIcon} color="black" />
              </IconWrapper>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.hotContainer}>
          <HotPreView pageSize={5} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionHeaderHot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    width: 26,
    height: 26,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 8,
    marginHorizontal: 8,
    color: semanticColors.text.primary,
  },
  mlAuto: {
    marginLeft: "auto",
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  faqButton: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 5,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  faqIcon: {
    width: 16,
    height: 16,
  },
  faqText: {
    fontSize: 14,
    color: semanticColors.text.primary,
  },
  noticeContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  hotContainer: {
    marginHorizontal: 2,
    marginBottom: 2,
  },
});
