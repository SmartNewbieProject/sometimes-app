import Layout from "@/src/features/layout";
import {
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
import SettingIcon from "@assets/icons/setting.svg";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <Layout.Default
      style={{
        backgroundColor: "#fff",
      }}
    >
      <Header.Container className="items-center ">
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
              <Pressable onPress={() => router.navigate("/setting")}>
                <SettingIcon width={24} height={24} />
              </Pressable>
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
    paddingBottom: 24,
  },
  menuContainer: {
    paddingHorizontal: 10,
  },
});
