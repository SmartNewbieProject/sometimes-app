import Layout from "@/src/features/layout";
import {
  LogoutOrWithdrawal,
  MatchingMenu,
  MyActivityMenu,
  Notice,
  Profile,
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
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: "#fff",
      }}
    >
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

        <View style={styles.menuContainer}>
          <MatchingMenu />
          <MyActivityMenu />
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
  menuContainer: {
    paddingHorizontal: 10,
  },
});
