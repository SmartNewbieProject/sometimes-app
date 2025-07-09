import Layout from "@/src/features/layout";
import {
  LogoutOrWithdrawal,
  Notice,
  Profile,
  ProfileMenu,
} from "@/src/features/mypage/ui";
import {
  BottomNavigation,
  Button,
  Header,
  PalePurpleGradient,
  Text,
} from "@/src/shared/ui";
import { Image } from "expo-image";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyScreen() {
  const insets = useSafeAreaInsets();
  return (
    <Layout.Default
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <PalePurpleGradient />

      <Header.Container className="items-center !pt-[21px] ">
        <Header.LeftContent>
          <Header.LeftButton visible={false} />
        </Header.LeftContent>
        <Header.CenterContent>
          <Image
            source={require("@assets/images/MY_LOGO.png")}
            style={{ width: 40, height: 20 }}
            contentFit="contain"
          />
        </Header.CenterContent>

        <Header.RightContent>
          <TouchableOpacity>
            <View style={styles.iconContainer}>
              <View style={styles.iconPlace} />
              <View style={styles.iconPlace} />
            </View>
          </TouchableOpacity>
        </Header.RightContent>
      </Header.Container>

      <ScrollView style={styles.scrollViewContainer}>
        <View style={styles.profileContainer}>
          <Profile />
        </View>
        {/* TODO: 정식 오픈 시 주석 해제 필요 */}
        {/* <Notice />
        <View className="py-10 items-center justify-center"> */}
        <View className="items-center flex flex-col gap-y-4 justify-center">
          {/* TODO: 정식 오픈 시 주석 해제 필요 */}
          <ProfileMenu />
          <LogoutOrWithdrawal />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </Layout.Default>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  profileContainer: {
    paddingTop: 0,
    paddingBottom: 16,
  },
  iconPlace: {
    width: 40,
    height: 40,
  },
  scrollViewContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
