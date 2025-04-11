import { Bar } from "react-native-progress";
import colors from "../../constants/colors";

export const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <Bar
      progress={progress}
      color={colors.primaryPurple}
      unfilledColor={colors.lightPurple}
      borderColor={colors.primaryPurple}
      borderWidth={1}
      height={10}
    />
  );
};
