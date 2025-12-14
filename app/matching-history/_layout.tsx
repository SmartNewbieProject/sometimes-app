import { useRematchingTickets } from "@/src/features/mypage/queries";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { Header, Text } from "@/src/shared/ui";
import ChevronLeftIcon from "@assets/icons/chevron-left.svg";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import {useCurrentGem} from "@features/payment/hooks";
import {ImageResource} from "@ui/image-resource";
import {ImageResources} from "@shared/libs";
import { useTranslation } from "react-i18next";

export default function MatchingHistoryLayoutScreen() {
  const router = useRouter();
  const { data: gem } = useCurrentGem();
  const {t} = useTranslation();
  return (
    <View className="flex-1">
      <Header.Container className="border-b items-center border-b-[#E7E9EC]">
        <Header.LeftContent>
          <Pressable
            onPress={() => router.navigate("/")}
            className="pt-2 -ml-2"
          >
            <ChevronLeftIcon width={24} height={24} />
          </Pressable>
        </Header.LeftContent>
        <Header.CenterContent className=" pt-2">
          <Text textColor="black" size="20" weight="bold">
            {t("apps.matching_history.header_title")}
          </Text>
        </Header.CenterContent>
        <Header.RightContent>
          <Pressable
            onPress={() => router.push("/purchase/gem-store")}
            style={styles.rematchingContainer}
          >
            <Text
              numberofLine={1}
              textColor={"black"}
              size={"13"}
              style={styles.rematchingCount}
            >
              {gem?.totalGem ?? 0}{t("apps.matching_history.gem_unit")}
            </Text>
            <ImageResource resource={ImageResources.GEM} width={28} height={28} />
          </Pressable>
        </Header.RightContent>
      </Header.Container>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: semanticColors.surface.background,
            },
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  rematchingContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    backgroundColor: semanticColors.surface.secondary,
    borderRadius: 9,
    position: "absolute",
    right: 0,
    top: -11,
    gap: 5,
    paddingVertical: 1,
    minWidth: 64,
    alignItems: "center",
  },
  rematchingCount: {
    lineHeight: 22,
  },
});
