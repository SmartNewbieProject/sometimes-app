import { Check, Text } from "@/src/shared/ui";
import { useFormContext } from "react-hook-form";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ArticleWriterForm } from "../../../hooks";
import { useTranslation } from "react-i18next";



export const ArticleWriteNav = ({ mode }: { mode: "create" | "update" }) => {
  const { watch, setValue } = useFormContext<ArticleWriterForm>();
  const insets = useSafeAreaInsets();
  const anonymous = watch("anonymous");
  const { t } = useTranslation();

  const onToggleAnonymous = () => {
    setValue("anonymous", !anonymous);
  };

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="bg-white border-t border-lightPurple px-5 pt-4 flex flex-row justify-end"
    >
      <View className="flex-row items-center gap-x-2">
        {mode === "create" && (
          <Check.Box checked={anonymous} size={25} onChange={onToggleAnonymous}>
            <Text className="text-[15px] text-[#000000] font-medium">{t("features.community.ui.article_write_screen.nav.anonymous")}</Text>
          </Check.Box>
        )}
      </View>
    </View>
  );
};
