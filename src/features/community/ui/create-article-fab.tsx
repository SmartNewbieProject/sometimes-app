import WriteIcon from "@/assets/icons/write.svg";
import { IconWrapper } from "@shared/ui/icons";
import { router } from "expo-router";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../../auth";
import { useCategory } from "../hooks";
import { useQuery } from "@tanstack/react-query";
import { getMySimpleDetails } from "@/src/features/auth/apis";
import colors from "@/src/shared/constants/colors";

type MySimpleDetails = {
  /** @deprecated 하위 호환성을 위해 유지 */
  role?: "admin" | "user" | "tester";
  roles: ("admin" | "user" | "tester")[];
  id: string;
  profileId: string;
  name: string;
};

const isNoticeCategory = (code?: string) => {
  if (!code) return false;
  return code === "notice";
};
const isPopularCategory = (code?: string) => {
  if (!code) return false;
  return code === "hot";
};

const styles = StyleSheet.create({
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
    position: "absolute",
    bottom: 96,
    right: 24,
  },
});

export const CreateArticleFAB = () => {
  const { currentCategory } = useCategory();
  const { profileDetails } = useAuth();

  const { data: me } = useQuery<MySimpleDetails>({
    queryKey: ["my-simple-details"],
    queryFn: async () => await getMySimpleDetails(),
    enabled: !!profileDetails,
    staleTime: 5 * 60 * 1000,
  });

  const isAdmin = me?.roles?.includes("admin") || me?.role === "admin";

  const shouldHideForRole =
    isPopularCategory(currentCategory) ||
    (isNoticeCategory(currentCategory) && !isAdmin);

  if (!profileDetails) return null;
  if (shouldHideForRole) return null;

  return (
    <TouchableOpacity
      onPress={() =>
        router.push(`/community/write?category=${currentCategory}`)
      }
      style={styles.fabButton}
      accessibilityRole="button"
      accessibilityLabel="새 글 작성"
    >
      <IconWrapper>
        <WriteIcon stroke="#FFFFFF" />
      </IconWrapper>
    </TouchableOpacity>
  );
};
