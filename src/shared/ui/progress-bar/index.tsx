import { Bar } from "react-native-progress";
import colors from "../../constants/colors";

export const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <Bar
      progress={progress}
      color={colors.primaryPurple}
      unfilledColor="#F3EDFF"
      borderWidth={0}
      borderRadius={100}
      width={330}
      height={12}
    />
  );
};
