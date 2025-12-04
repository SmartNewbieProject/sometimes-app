// UserInfoPage.tsx
import { DefaultLayout } from "@/src/features/layout/ui";
import { semanticColors } from '../../../src/shared/constants/colors';
import Signup from "@/src/features/signup";
import { useStorage } from "@/src/shared/hooks/use-storage";
import { track } from "@/src/shared/libs/amplitude-compat";
import { Image } from "expo-image";
import { router, useGlobalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text ,
  BackHandler,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";


const { useSignupProgress } = Signup;

export default function UserInfoPage() {
  const { t } = useTranslation();
  const { updateForm, form } = useSignupProgress();

  const insets = useSafeAreaInsets();

  const { value: appleUserFullName, loading: fullNameLoading } = useStorage<
    string | null
  >({ key: "appleUserFullName" });

  const [name, setName] = useState(form.name || "");
  const [gender, setGender] = useState(form.gender || null);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [phone, setPhone] = useState(form.phone || "010");

  const monthRef = useRef<TextInput>(null);
  const dayRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  let appleUserName = null;

  if (Platform.OS === "web") {
    if (sessionStorage.getItem("appleUserFullName")) {
      appleUserName = sessionStorage.getItem("appleUserFullName");
    }
  } else if (Platform.OS === "ios") {
    if (appleUserFullName) {
      appleUserName = appleUserFullName;
    }
  }

  useEffect(() => {
    if (appleUserName) {
      setName(appleUserName);
      updateForm({ name: appleUserName });
    }
  }, [appleUserName]);

  // 이름이 useStorage 값으로 채워진 경우, 이름을 필수 입력 조건에서 제외.
  const isFormComplete =
    (!!name || !!appleUserName) &&
    !!gender &&
    year.length === 4 &&
    month.length > 0 &&
    day.length === 2 &&
    phone.length === 11;

  const onNext = async () => {
    if (!isFormComplete) return;

    const formattedPhoneNumberForServer = formatDisplayedPhoneNumber(phone);

    updateForm({
      name,
      gender,
      birthday: `${year}-${month}-${day}`,
      phone: formattedPhoneNumberForServer,
    });

    router.push("/auth/signup/university");
  };

  /**
   * @param {string} rawPhoneNumber The raw phone number (e.g., "01012345678").
   * @returns {string}
   */
  const formatDisplayedPhoneNumber = (rawPhoneNumber: string): string => {
    // Added type annotation
    // If no raw phone number, display "010-" as a starting point for input
    if (!rawPhoneNumber) return "010-";

    const digits = rawPhoneNumber.replace(/\D/g, ""); // Ensure only digits are processed

    // Format based on the number of digits
    if (digits.length <= 3) {
      return digits; // e.g., "010"
    }
    if (digits.length <= 7) {
      return `${digits.substring(0, 3)}-${digits.substring(3)}`; // e.g., "010-1234"
    }
    if (digits.length <= 11) {
      return `${digits.substring(0, 3)}-${digits.substring(
        3,
        7
      )}-${digits.substring(7, 11)}`; // e.g., "010-1234-5678"
    }
    return digits.substring(0, 11);
  };

  /**
   * Handles changes to the phone number TextInput, ensuring '010' prefix and 11-digit format.
   * @param {string} inputText The current text from the TextInput.
   */
  const handlePhoneNumberChange = (inputText: string) => {
    // Added type annotation
    // Remove all non-digit characters from the input text
    let digitsOnly = inputText.replace(/\D/g, "");

    // Ensure the phone number always starts with '010'
    if (!digitsOnly.startsWith("010")) {
      if (digitsOnly.length === 0) {
        // If the input is completely cleared, reset to '010'
        digitsOnly = "010";
      } else {
        // If user types other digits, prepend '010' to those digits
        // and take up to 8 of the user's new digits
        digitsOnly = `010${digitsOnly.substring(0, 8)}`;
      }
    }

    // Limit the total number of digits to 11 (e.g., '010' + 8 digits)
    if (digitsOnly.length > 11) {
      digitsOnly = digitsOnly.substring(0, 11);
    }

    // If after processing, the digits are less than 3 (meaning '010' might have been partially deleted),
    // ensure it snaps back to '010'. This handles backspacing over the '010' prefix.
    if (digitsOnly.length < 3 && inputText.length < 3) {
      setPhone("010");
    } else {
      setPhone(digitsOnly);
    }
  };

  if (fullNameLoading) {
    return null;
  }

  const shouldHideNameInput = !!appleUserFullName;

  return (
    <DefaultLayout>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Text style={styles.topBarTitle}>{t("apps.auth.login.apple_login_title")}</Text>
      </View>

      <ScrollView
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        style={{
          paddingTop: 50 + insets.top,
          paddingBottom: 140 + insets.bottom,
          flex: 1,
        }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
        }}
      >
        <View className="px-[5px]">
          <Image
            source={require("@assets/images/details.png")}
            style={{ width: 81, height: 81, marginTop: 30 }}
            className="mb-4"
          />
        </View>

        {!shouldHideNameInput && (
          <View style={styles.contentWrapper}>
            <Text style={styles.title}>{t("apps.auth.register.input_name")}</Text>
            <TextInput
              style={styles.nameInput}
              placeholder={t("apps.auth.register.miho")}
              value={name}
              onChangeText={setName}
              maxLength={20}
            />
          </View>
        )}

        <View style={styles.contentWrapper}>
          <Text style={styles.title}>{t("apps.auth.register.input_sex")}</Text>
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
                {t("apps.auth.register.male")}
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
                {t("apps.auth.register.female")}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <Text style={styles.title}>{t("apps.auth.register.input_birth")}</Text>
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
          <Text style={styles.title}>{t("apps.auth.register.input_phone")}</Text>
          <TextInput
            ref={phoneRef}
            style={styles.phoneInput}
            placeholder={t("apps.auth.register.phone_placeholder")}
            keyboardType="number-pad"
            maxLength={13}
            value={formatDisplayedPhoneNumber(phone)}
            onChangeText={handlePhoneNumberChange}
          />
        </View>
      </ScrollView>

      <View
        style={[styles.bottomContainer, { bottom: insets.bottom }]}
        className="w-[calc(100%)]"
      >
        <View style={styles.messageContainer}>
          <Image
            source={require("@assets/images/favorite.png")}
            style={styles.heartIcon}
          />
          <Text style={styles.msg}>{t("apps.auth.register.please_input")}!</Text>
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
            {isFormComplete ? t("apps.auth.register.start_sometime") : t("apps.auth.register.who_am_i")}
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
    backgroundColor: semanticColors.surface.background,
    position: "absolute",
    width: "100%",
    zIndex: 10,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: semanticColors.text.primary,
  },
  title: {
    fontWeight: "600",
    fontFamily: "semibold",
    fontSize: 18,
    lineHeight: 22,
    color: semanticColors.brand.primary,
  },
  contentWrapper: {
    gap: 15,
    marginTop: 34,
    paddingHorizontal: 10,
  },
  nameInput: {
    width: 305.45,
    height: 37,
    color: "#BAB0D0",
    borderRadius: 15,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    backgroundColor: semanticColors.surface.background,
    textAlign: "left",
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
    borderColor: semanticColors.border.default,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: semanticColors.surface.background,
  },
  genderButtonSelected: {
    backgroundColor: semanticColors.brand.primary,
  },
  genderButtonText: {
    color: "#BAB0D0",
    fontFamily: "semibold",
    fontSize: 15,
  },
  genderButtonTextSelected: {
    color: semanticColors.text.inverse,
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
    borderColor: semanticColors.border.default,
    backgroundColor: semanticColors.surface.background,
    textAlign: "left",
  },
  phoneInput: {
    width: 305.45,
    height: 37,
    color: "#BAB0D0",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    paddingHorizontal: 16,
    backgroundColor: semanticColors.surface.background,
    textAlign: "left",
  },
  bottomContainer: {
    position: "absolute",
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: semanticColors.surface.background,
    alignItems: "center",
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
    backgroundColor: semanticColors.surface.background,
    width: 330,
    height: 50,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  startButtonActive: {
    backgroundColor: semanticColors.brand.primary,
  },
  startButtonDisabled: {
    backgroundColor: semanticColors.surface.background,
  },
  startButtonText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  startButtonTextActive: {
    color: semanticColors.text.inverse,
  },
  startButtonTextDisabled: {
    color: semanticColors.text.disabled,
  },
});
