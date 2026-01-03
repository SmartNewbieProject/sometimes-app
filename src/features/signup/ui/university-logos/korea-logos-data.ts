import { ImageSourcePropType } from "react-native";

export interface UniversityLogoData {
  row1: ImageSourcePropType[];
  row2: ImageSourcePropType[];
}

export const koreaUniversityLogos: UniversityLogoData = {
  row1: [
    require("@/assets/images/univ/cheonan/caschu.webp"),
    require("@/assets/images/univ/busan/pnu.webp"),
    require("@/assets/images/univ/daegu/dgcau.webp"),
    require("@/assets/images/univ/busan/kmou.webp"),
    require("@/assets/images/univ/daegu/dgdart.webp"),
    require("@/assets/images/univ/incheon/icninu.webp"),
    require("@/assets/images/univ/busan/dau.webp"),
    require("@/assets/images/univ/daegu/dgdau.webp"),
    require("@/assets/images/univ/incheon/icninu.webp"),
    require("@/assets/images/univ/busan/ksu.webp"),
    require("@/assets/images/univ/daegu/dgdhu.webp"),
    require("@/assets/images/univ/incheon/icninha.webp"),
  ],
  row2: [
    require("@/assets/images/univ/daejeon/hbu.webp"),
    require("@/assets/images/univ/busan/deu.webp"),
    require("@/assets/images/univ/daegu/dgkit.webp"),
    require("@/assets/images/univ/daejeon/hnu.webp"),
    require("@/assets/images/univ/busan/ku.webp"),
    require("@/assets/images/univ/daegu/dgkmu.webp"),
    require("@/assets/images/univ/daejeon/kaist.webp"),
    require("@/assets/images/univ/busan/dsu.webp"),
    require("@/assets/images/univ/daegu/dgknu.webp"),
    require("@/assets/images/univ/daejeon/kyu.webp"),
    require("@/assets/images/univ/busan/tmu.webp"),
    require("@/assets/images/univ/daegu/dgynu.webp"),
  ],
};
