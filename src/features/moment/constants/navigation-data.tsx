import React from "react";
import { Text } from "react-native";
import { router } from "expo-router";
import { MomentNavigationItem } from "../types";
import colors from "@/src/shared/constants/colors";

// Title 컴포넌트들
const EventsTitle = () => (
  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.black, lineHeight: 22 }}>
    진행중인 이벤트
  </Text>
);

const MyMomentTitle = () => (
  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.black, lineHeight: 22 }}>
    나의 모먼트
  </Text>
);

const CheckInTitle = () => (
  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.black, lineHeight: 22 }}>
    출석체크
  </Text>
);

const RouletteTitle = () => (
  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.black, lineHeight: 22 }}>
    데일리 룰렛
  </Text>
);

const SomemateTitle = () => (
  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.black, lineHeight: 22 }}>
    썸메이트
  </Text>
);

const WeeklyReportTitle = () => (
  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.black, lineHeight: 22 }}>
    모먼트 보고서
  </Text>
);

export const MOMENT_NAVIGATION_ITEMS: MomentNavigationItem[] = [
  {
    id: "moment-events",
    titleComponent: <EventsTitle />,
    description: "썸타임에서 진행중인 이벤트를 확인하고 지금 상품을 받아가세요!",
    backgroundImageUrl: require("@/assets/images/moment/menu/events.png"),
    imageSize: 100,
    isReady: false,
    disabledMessage: "곧 다양한 이벤트로 찾아뵙겠습니다!",
    onPress: () => {
      console.log("진행중인 이벤트로 이동");
    },
  },
  {
    id: "moment-my-moment",
    titleComponent: <MyMomentTitle />,
    description: "다양한 활동으로\n나의 연애 성향을\n분석해보세요!",
    backgroundImageUrl: require("@/assets/images/moment/menu/moment.png"),
    imageSize: 100,
    onPress: () => {
      router.push("/moment/my-moment");
    },
  },
  {
    id: "moment-check-in",
    titleComponent: <CheckInTitle />,
    description: "매일 출석하고\n상품을 받아가기",
    backgroundImageUrl: require("@/assets/images/moment/menu/check.png"),
    isReady: false,
    disabledMessage: "출석 체크 기능을 준비하고 있습니다!",
    onPress: () => {
      console.log("출석체크로 이동");
    },
  },
  {
    id: "moment-daily-roulette",
    titleComponent: <RouletteTitle />,
    description: "룰렛을 돌려\n오늘의 운세 시험하기",
    backgroundImageUrl: require("@/assets/images/moment/menu/roulette.png"),
    disabledText: "참여 완료!",
    disabledMessage: "오늘은 이미 참여했어요!",
    onPress: () => {
      router.push("/moment/daily-roulette");
    },
  },
  {
    id: "moment-somemate",
    titleComponent: <SomemateTitle />,
    description: "대화할수록 나를\n더 잘 아는 썸메이트",
    backgroundImageUrl: require("@/assets/images/moment/menu/persona.png"),
    onPress: () => {
      router.push("/chat/somemate");
    },
  },
  {
    id: "moment-weekly-report",
    titleComponent: <WeeklyReportTitle />,
    description: "이번 주 활동을\n리포트로 확인해보세요!",
    backgroundImageUrl: require("@/assets/images/moment/menu/moment.png"),
    onPress: () => {
      router.push("/moment/weekly-report");
    },
  },
];