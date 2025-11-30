import { useRematchingTickets } from "@/src/features/mypage/queries";
import { semanticColors } from '@/src/shared/constants/colors';
import { Header, Text } from "@/src/shared/ui";
import ChevronLeftIcon from "@assets/icons/chevron-left.svg";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import {useCurrentGem} from "@features/payment/hooks";
import {ImageResource} from "@ui/image-resource";
import {ImageResources} from "@shared/libs";

export default function MatchingHistoryLayoutScreen() {
  const router = useRouter();
  const { data: gem } = useCurrentGem();
  return (
    <View style={styles.flexOne}>
      <Header.Container style={[styles.headerContainer, styles.borderBottom]}>
        <Header.LeftContent>
          <Pressable
            onPress={() => router.navigate("/")}
            style={styles.backButton}
          >
            <ChevronLeftIcon width={24} height={24} />
          </Pressable>
        </Header.LeftContent>
        <Header.CenterContent style={styles.centerContent}>
          <Text textColor="black" size="20" weight="bold">
            이전매칭
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
              {gem?.totalGem ?? 0}개
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
  flexOne: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#E7E9EC',
  },
  backButton: {
    paddingTop: 8,
    marginLeft: -8,
  },
  centerContent: {
    paddingTop: 8,
  },
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
