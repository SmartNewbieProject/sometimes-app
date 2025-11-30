import { Check, Text } from "@/src/shared/ui";
import { useFormContext } from "react-hook-form";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ArticleWriterForm } from "../../../hooks";
import colors from "@/src/shared/constants/colors";
import { semanticColors } from "@/src/shared/constants/colors";

const styles = StyleSheet.create({
  container: {
    backgroundColor: semanticColors.surface.background,
    borderTopWidth: 1,
    borderTopColor: "#E2D5FF",
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  anonymousContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  anonymousText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});

export const ArticleWriteNav = ({ mode }: { mode: "create" | "update" }) => {
  const { watch, setValue } = useFormContext<ArticleWriterForm>();
  const insets = useSafeAreaInsets();
  const anonymous = watch("anonymous");

  const onToggleAnonymous = () => {
    setValue("anonymous", !anonymous);
  };

  return (
    <View
      style={[styles.container, { paddingBottom: insets.bottom }]}
    >
      <View style={styles.anonymousContainer}>
        {mode === "create" && (
          <Check.Box checked={anonymous} size={25} onChange={onToggleAnonymous}>
            <Text style={styles.anonymousText}>익명</Text>
          </Check.Box>
        )}
      </View>
    </View>
  );
};
