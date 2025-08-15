import { DefaultLayout, TwoButtons } from "@/src/features/layout/ui";
import Signup from "@/src/features/signup";
import { Text } from "react-native";
import { track } from "@amplitude/analytics-react-native";
import { Image } from "expo-image";
import { router, useGlobalSearchParams } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  BackHandler,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { useSignupProgress } = Signup;

export default function UserInfoPage() {
  const { updateForm, form } = useSignupProgress();

  const [gender, setGender] = useState(form.gender || null);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [phone, setPhone] = useState("");

  const monthRef = useRef<TextInput>(null);
  const dayRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const isFormComplete =
    !!gender &&
    year.length === 4 &&
    month.length === 2 &&
    day.length === 2 &&
    phone.length === 11;

  const onNext = async () => {
    if (!isFormComplete) return;

    updateForm({
      gender,
      birthday: `${year}-${month}-${day}`,
      phone,
    });

    router.push("/auth/signup/area");
  };

  return (
    <DefaultLayout>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Apple 로그인</Text>
      </View>
      <ScrollView
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingBottom: 140,
        }}
      >
        <View className="px-[5px]">
          <Image
            source={require("@assets/images/details.png")}
            style={{ width: 81, height: 81, marginTop: 30 }}
            className="mb-4"
          />
        </View>

        <View style={styles.contentWrapper}>
          <Text style={styles.title}>성별을 선택해주세요</Text>
          <View style={styles.genderButtonContainer}>
            <Pressable
              style={[
                styles.genderButton,
                gender === "MALE" && styles.genderButtonSelected,
              ]}
              onPress={() => setGender("MALE")}
            >
              <Text
                style={
                  gender === "MALE"
                    ? styles.genderButtonTextSelected
                    : styles.genderButtonText
                }
              >
                남성
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.genderButton,
                gender === "FEMALE" && styles.genderButtonSelected,
              ]}
              onPress={() => setGender("FEMALE")}
            >
              <Text
                style={
                  gender === "FEMALE"
                    ? styles.genderButtonTextSelected
                    : styles.genderButtonText
                }
              >
                여성
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <Text style={styles.title}>생년월일을 입력해주세요</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY"
              keyboardType="number-pad"
              maxLength={4}
              value={year}
              onChangeText={(text) => {
                setYear(text);
                if (text.length === 4 && monthRef.current) {
                  monthRef.current.focus();
                }
              }}
            />
            <TextInput
              ref={monthRef}
              style={styles.dateInput}
              placeholder="MM"
              keyboardType="number-pad"
              maxLength={2}
              value={month}
              onChangeText={(text) => {
                setMonth(text);
                if (text.length === 2 && dayRef.current) {
                  dayRef.current.focus();
                }
              }}
            />
            <TextInput
              ref={dayRef}
              style={styles.dateInput}
              placeholder="DD"
              keyboardType="number-pad"
              maxLength={2}
              value={day}
              onChangeText={(text) => {
                setDay(text);
                if (text.length === 2 && phoneRef.current) {
                  phoneRef.current.focus();
                }
              }}
            />
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <Text style={styles.title}>전화번호를 입력해주세요</Text>
          <TextInput
            ref={phoneRef}
            style={styles.phoneInput}
            placeholder="휴대폰 번호 입력('-' 제외 11자리 입력)"
            keyboardType="number-pad"
            maxLength={11}
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      </ScrollView>

      <View style={[styles.bottomContainer]} className="w-[calc(100%)]">
        <View style={styles.messageContainer}>
          <Image
            source={require("@assets/images/favorite.png")}
            style={styles.heartIcon}
          />
          <Text style={styles.msg}>회원가입을 위해 정보를 입력해주세요!</Text>
        </View>
        <Pressable
          style={[
            styles.startButton,
            isFormComplete
              ? styles.startButtonActive
              : styles.startButtonDisabled,
          ]}
          onPress={onNext}
          disabled={!isFormComplete}
        >
          <Text
            style={[
              styles.startButtonText,
              isFormComplete
                ? styles.startButtonTextActive
                : styles.startButtonTextDisabled,
            ]}
          >
            {isFormComplete ? "썸타임 시작하기" : "내가 누구인지 알려주세요!"}
          </Text>
        </Pressable>
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  title: {
    fontWeight: "600",
    fontFamily: "Pretendard-SemiBold",
    fontSize: 18,
    lineHeight: 22,
    color: "#7A4AE2",
  },
  contentWrapper: {
    gap: 15,
    marginTop: 34,
    paddingHorizontal: 10,
  },
  genderButtonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  genderButton: {
    width: 102,
    height: 37,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E2D9FF",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  genderButtonSelected: {
    backgroundColor: "#7A4AE2",
  },
  genderButtonText: {
    color: "#BAB0D0",
    fontFamily: "Pretendard-SemiBold",
    fontSize: 15,
  },
  genderButtonTextSelected: {
    color: "#FFFFFF",
  },
  dateInputContainer: {
    flexDirection: "row",
    gap: 10,
  },
  dateInput: {
    width: 102,
    height: 37,
    color: "#BAB0D0",
    borderRadius: 15,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2D9FF",
    backgroundColor: "#FFFFFF",
    textAlign: "left",
  },
  phoneInput: {
    width: 305.45,
    height: 37,
    color: "#BAB0D0",
    borderRadius: 1,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2D9FF",
    backgroundColor: "#FFFFFF",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  heartIcon: {
    width: 16,
    height: 16,
    marginRight: 2,
  },
  msg: {
    fontSize: 13,
    color: "#BAB0D0",
    marginLeft: 5,
  },
  startButton: {
    backgroundColor: "#E2D9FF",
    width: 330,
    height: 50,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  startButtonActive: {
    backgroundColor: "#7A4AE2",
  },
  startButtonDisabled: {
    backgroundColor: "#E2D9FF",
  },
  startButtonText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  startButtonTextActive: {
    color: "#FFFFFF",
  },
  startButtonTextDisabled: {
    color: "#9B94AB",
  },
});
