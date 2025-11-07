import { Image } from "expo-image";
import { router } from "expo-router";
import { Platform, StyleSheet, Text, View, Pressable, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated";
import ChevronLeft from "@assets/icons/chevron-left.svg";
import VerticalEllipsisIcon from "@assets/icons/vertical-ellipsis.svg";
import DateDivider from "@/src/features/chat/ui/message/date-divider";
import BackgroundHeartIcon from "@assets/icons/new-chat-banner-heart.svg";
import BulbIcon from "@assets/icons/bulb.svg";
import { SomemateInput } from "@/src/features/somemate/ui";

type ListItem =
  | { type: "spacer"; id: string }
  | { type: "date"; date: string }
  | { type: "matchBanner" }
  | { type: "guideBanner" };

export default function SomemateChatScreen() {
  const insets = useSafeAreaInsets();

  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  const date = `${year}년 ${month}월 ${day}일`;

  const keyboard = useAnimatedKeyboard();

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          Platform.OS === "android"
            ? 0
            : -keyboard.height.value + insets.bottom,
      },
    ],
  }));

  const handleSend = (message: string) => {
    // TODO: 메시지 전송 로직
    console.log("Send message:", message);
  };

  const listData: ListItem[] = [
    { type: "spacer", id: "top" },
    { type: "date", date },
    { type: "spacer", id: "afterDate" },
    { type: "matchBanner" },
    { type: "spacer", id: "afterMatch" },
    { type: "guideBanner" },
    { type: "spacer", id: "bottom" },
  ];

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "spacer") {
      return <View style={{ height: 15 }} />;
    }
    if (item.type === "date") {
      return <DateDivider date={item.date} />;
    }
    if (item.type === "matchBanner") {
      return (
        <View style={styles.matchBanner}>
          <View style={{ position: "relative" }}>
            <BackgroundHeartIcon />
            <Image
              source={require("@assets/images/somemate_miho.png")}
              style={styles.bannerIcon}
              contentFit="cover"
            />
          </View>
          <Text style={styles.matchTitle}>
            반가워요! <Text style={[styles.matchTitle, styles.matchName]}>미호</Text>와의 대화를 시작해볼까요?
          </Text>
          <Text style={styles.matchSubtext}>대화를 이어가며 나만의 인사이트를 받아보세요</Text>
        </View>
      );
    }
    if (item.type === "guideBanner") {
      return (
        <View style={styles.guideBanner}>
          <View style={styles.guideHeader}>
            <BulbIcon />
            <Text style={styles.guideTitle}>미호는 대화를 통해 성향을 분석해요</Text>
          </View>
          <View style={styles.guideContent}>
            <View style={styles.guideItem}>
              <Text style={styles.guideText}>
                자유롭게 이야기하면서 관심 있는 주제나 고민을 나누어 보세요!
              </Text>
            </View>
            <View style={styles.guideItem}>
              <Text style={styles.guideText}>
                10회 이상 대화를 나누면 분석 리포트를 받을 수 있어요
              </Text>
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: insets.top,
        width: "100%",
        paddingBottom: insets.bottom + 4,
      }}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/chat/somemate")}>
          <ChevronLeft width={20} height={20} />
        </Pressable>
        <Pressable style={styles.profileSection}>
          <Image
            source={require("@assets/images/somemate_miho.png")}
            style={styles.profileImage}
            contentFit="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>미호</Text>
            <Text style={styles.subtitle}>대화 2턴</Text>
          </View>
        </Pressable>
        <Pressable style={styles.menuButton}>
          <VerticalEllipsisIcon />
        </Pressable>
      </View>

      <Animated.View
        style={[
          {
            flex: 1,
            width: "100%",
            backgroundColor: "#FAFAFA",
            alignContent: "center",
            justifyContent: "center",
          },
          animatedStyles,
        ]}
      >
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.type === "spacer" ? item.id : `${item.type}-${index}`
          }
          style={{
            paddingHorizontal: 16,
            width: "100%",
            flex: 1,
          }}
          contentContainerStyle={{
            gap: 10,
          }}
          keyboardShouldPersistTaps="handled"
        />

        <SomemateInput onSend={handleSend} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 68,
    backgroundColor: "#fff",
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: 34,
    marginLeft: 7,
    marginRight: 10,
    height: 34,
    borderRadius: 17,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: "#000",
    fontWeight: "700",
    fontFamily: "Pretendard-ExtraBold",
    fontSize: 18,
    lineHeight: 19,
  },
  subtitle: {
    color: "#767676",
    fontSize: 13,
    lineHeight: 19,
  },
  menuButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  matchBanner: {
    paddingVertical: 8,
    backgroundColor: "#FDFBFF",
    borderRadius: 10,
    marginHorizontal: 16,
    alignItems: "center",
    gap: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#7A4AE266",
  },
  bannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    position: "absolute",
    top: 7,
    left: 8,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 27,
    color: "#000",
  },
  matchName: {
    color: "#7A4AE2",
    fontWeight: "800",
    fontFamily: "Pretendard-ExtraBold",
  },
  matchSubtext: {
    fontSize: 14,
    lineHeight: 21,
    color: "#898A8D",
  },
  guideBanner: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#73727566",
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  guideTitle: {
    color: "#737275",
    fontSize: 15,
    lineHeight: 22,
  },
  guideContent: {
    marginTop: 12,
    gap: 4,
    paddingHorizontal: 7,
  },
  guideItem: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#FBF9FF",
  },
  guideText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#737275",
  },
});

