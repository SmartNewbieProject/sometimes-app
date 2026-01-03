import WriteIcon from "@/assets/icons/write.svg";
import { useTranslation } from 'react-i18next';
import { IconWrapper } from "@shared/ui/icons";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useAuth } from "../../auth";
import { useCategory } from "../hooks";
import { useQuery } from "@tanstack/react-query";
import { getMySimpleDetails } from "@/src/features/auth/apis";

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

export const CreateArticleFAB = () => {
  const { t } = useTranslation();
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
      testID="create-article-fab"
      onPress={() =>
        router.push(`/community/write?category=${currentCategory}`)
      }
      style={styles.fab}
      accessibilityRole="button"
      accessibilityLabel={t("ui.새_글_작성")}
    >
      <IconWrapper>
        <WriteIcon stroke="#FFFFFF" />
      </IconWrapper>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 96,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: semanticColors.brand.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
});
