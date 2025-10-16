
import { DefaultLayout, TwoButtons } from "@/src/features/layout/ui";
import {SignupSteps } from "@/src/features/signup/hooks";
import { Text } from "@/src/shared/ui/text";
import { Image } from "expo-image";
import {

  StyleSheet,
  View,
} from "react-native";

import { withSignupValidation } from "@/src/features/signup/ui/withSignupValidation";
import CodeForm from "./code-form";
import Loading from "@/src/features/loading";
import useInviteCode from "../../hooks/use-invite-code";



function InviteCode() {
  const {signupLoading, storageLoading, onNext, onBackPress} = useInviteCode()

   if (signupLoading || storageLoading) {
    return <Loading.Page />;
  }
  return (
    <DefaultLayout style={styles.layout}>
        <View style={styles.titleContainer}>
          <Image
            source={require("@assets/images/invite-code-key.png")}
            style={styles.image}
          />
          <Text weight="semibold" size="20" textColor="black" className="mt-2">
            받으신 초대코드가 있다면
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            입력해주세요!
          </Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text weight="medium" size="sm" textColor="pale-purple">
            초대코드는 회원가입 시에만 입력 가능해요
          </Text>
        </View>
        <CodeForm />

        

      <View style={[styles.bottomContainer]} className="w-[calc(100%)]">
        <TwoButtons
          disabledNext={false}
          onClickNext={onNext}
          content={{ next: "넘어가기" }}
          onClickPrevious={onBackPress}
        />
      </View>
    </DefaultLayout>
  );
}

// export default withSignupValidation(InviteCode, SignupSteps.INVITE_CODE);

export default InviteCode
const styles = StyleSheet.create({
  layout: {
    flex: 1,
    position: "relative",
  },
  titleContainer: {
    paddingHorizontal: 30,
    
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    paddingTop: 16,
    paddingHorizontal: 0,
    backgroundColor: "#fff",
  },
  image: {
    width: 81,
    height: 81,
    marginBottom: 16
  },
  descriptionContainer: {
    paddingTop: 10,
    paddingLeft: 30,
    marginBottom: 42,
  }
});
