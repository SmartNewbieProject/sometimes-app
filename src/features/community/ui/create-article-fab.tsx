import WriteIcon from "@/assets/icons/write.svg";
import { IconWrapper } from "@shared/ui/icons";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
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
      className="w-[60px] h-[60px] rounded-full bg-brand-secondary items-center justify-center"
      style={{ position: "absolute", bottom: 96, right: 24 }}
      accessibilityRole="button"
      accessibilityLabel="새 글 작성"
    >
      <IconWrapper>
        <WriteIcon stroke="#FFFFFF" />
      </IconWrapper>
    </TouchableOpacity>
  );
};
