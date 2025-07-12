import NotSecuredIcon from "@/assets/icons/shield-not-secured.svg";

import { useCommingSoon } from "@/src/features/admin/hooks";
import { useAuth } from "@/src/features/auth";
import MyPage from "@/src/features/mypage";
import { Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Layout from "../../layout";
import { useRematchingTickets } from "../queries";
import CustomSwitch from "./custom-switch";

export const Profile = () => {
  const { profileDetails } = useAuth();
  console.log("prefileDetails", profileDetails);
  const { data: reMatchingTicketCount } = useRematchingTickets();
  const profileData = {
    name: profileDetails?.name || "이름",
    age: profileDetails?.age || "20",
    grade: profileDetails?.universityDetails?.grade || "19학번",
    university: profileDetails?.universityDetails?.name || "한밭대학교",
    profileImage:
      profileDetails?.profileImages?.[0]?.url ||
      require("@/assets/images/profile.png"),
    totalRematchingTickets: reMatchingTicketCount?.total ?? 0,
  };

  const handleProfileEdit = () => {
    router.push("/profile-edit/profile");
  };

  return (
    <View style={[styles.container]}>
      <LinearGradient
        colors={["#E9D9FF", "#D6B6FF"]}
        style={styles.baseRectangle}
      />
      <View style={styles.overlapWrapper}>
        <View style={styles.overlapRectangle}>
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                width: 130,
                height: 130,
                marginLeft: 10,

                borderRadius: 10,
                backgroundColor: "white",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={profileData.profileImage}
                style={{ borderRadius: 10, width: 120, height: 120 }}
              />
            </View>
            <View style={styles.profileInfoContainer}>
              <Text style={styles.name}>{profileData.name}</Text>
              <View style={styles.subInfo}>
                <Text style={styles.subInfoText}>{profileData.grade}</Text>
                <Text style={styles.subInfoText}> · </Text>
                <Text style={styles.subInfoText}>{profileData.university}</Text>
                <IconWrapper style={{ marginLeft: 3 }} size={14}>
                  <NotSecuredIcon />
                </IconWrapper>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                zIndex: 30,
                position: "absolute",
                top: -15,
                right: 15,
              }}
            >
              <TouchableOpacity onPress={handleProfileEdit}>
                <View style={styles.leftRect} />
                <View style={styles.leftRadius} />
                <View style={[styles.previousButton]}>
                  <View style={styles.updateContainer}>
                    <Image
                      source={require("@/assets/images/arrow-up.png")}
                      style={{ width: 20, height: 8 }}
                    />

                    <Text className="text-[10px] text-[#9747FF]">
                      프로필 수정
                    </Text>
                  </View>
                </View>
                <View style={styles.rightRect} />
                <View style={styles.rightRadius} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View
          className="pt-[5px] pl-[32px] flex-row"
          style={{ alignItems: "center" }}
        >
          <Image
            source={require("@/assets/images/ticket.png")}
            style={{ width: 30, height: 30 }}
          />
          <View className="pl-[10px] flex-row">
            <Text className="text-[13px] text-[#FFFFFF]">재매칭 티켓이</Text>
            <Text className="text-[13px] text-[#9747FF]">
              {" "}
              {profileData.totalRematchingTickets}장
            </Text>
            <Text className="text-[13px] text-[#FFFFFF]"> 남았어요</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  baseRectangle: {
    width: 331,
    height: 200,
    borderRadius: 15,
    zIndex: 0,
  },
  overlapWrapper: {
    position: "relative",
    marginTop: -185,
    zIndex: 1,
  },
  overlapRectangle: {
    width: 361,
    height: 150,
    borderRadius: 15,
    backgroundColor: "#9747FF",
    paddingRight: 15,
    paddingTop: 10,
    overflow: "hidden",
  },
  previousButton: {
    width: 74,
    height: 42.75,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    backgroundColor: "#E9D9FF",
  },
  leftRect: {
    width: 19,
    height: 20,
    backgroundColor: "#E9D9FF",
    position: "absolute",
    top: 5,
    left: -18,
  },
  leftRadius: {
    width: 20,
    height: 20,
    backgroundColor: "#9747FF",
    borderTopRightRadius: 14,
    position: "absolute",
    top: 5,
    left: -18,
  },
  rightRadius: {
    width: 20,
    height: 20,
    backgroundColor: "#9747FF",
    borderTopLeftRadius: 14,
    position: "absolute",
    top: 5,
    right: -18,
  },
  rightRect: {
    width: 19,
    height: 20,
    backgroundColor: "#E9D9FF",
    position: "absolute",
    top: 5,
    right: -18,
  },
  updateContainer: {
    paddingTop: 8,
    alignItems: "center",
    gap: 4,
  },
  name: {
    fontSize: 26,
    fontWeight: 400,
    lineHeight: 30,
    color: "#fff",
  },
  profileInfoContainer: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  subInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
  },
  subInfoText: {
    fontSize: 14,
    color: "#E6DBFF",
    lineHeight: 15.6,
  },
});

export default Profile;
