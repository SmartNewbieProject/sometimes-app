import AnimatedLogoRow from "./animated-logo-row";
import { japanUniversityLogos } from "./japan-logos-data";

interface JapanUniversityLogosProps {
  logoSize?: number;
}

export default function JapanUniversityLogos({ logoSize = 48 }: JapanUniversityLogosProps) {
  return (
    <AnimatedLogoRow
      row1Logos={japanUniversityLogos.row1}
      row2Logos={japanUniversityLogos.row2}
      logoSize={logoSize}
      accessibilityLabel="大学ロゴ"
    />
  );
}
