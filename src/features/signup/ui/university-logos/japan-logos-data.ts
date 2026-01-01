import type { UniversityLogoData } from "./korea-logos-data";
import { useTranslation } from 'react-i18next';

/**
 * 일본 대학교 로고 데이터
 *
 * 로고 파일 위치: assets/images/univ/japan/{region}/{university}.webp
 *
 * 지역별 대학 목록:
 * - tokyo: 도쿄대, 와세다, 게이오, 메이지, 릿쿄, 츄오, 호세이, 히토츠바시, 소피아, 도쿄공대, 도쿄이과대, ICU
 * - osaka: 오사카대, 교토대, 고베대, 간사이대, 도시샤, 리츠메이칸
 * - nagoya: 나고야대, 나고야공대
 * - fukuoka: 규슈대, 세이난학원
 * - sapporo: 홋카이도대
 * - sendai: 도호쿠대
 *
 * 로고 파일 추가 방법:
 * 1. 각 대학 공식 사이트 또는 Wikimedia Commons에서 로고 다운로드
 * 2. 48x48 또는 96x96 크기의 .webp 형식으로 변환
 * 3. assets/images/univ/japan/{region}/{university}.webp 경로에 저장
 * 4. 아래 주석 처리된 require 구문을 활성화
 */

/**
 * TODO: 로고 파일 추가 후 아래 주석을 해제하세요
 *
 * export const japanUniversityLogos: UniversityLogoData = {
 *   row1: [
 *     require("@/assets/images/univ/japan/tokyo/utokyo.webp"),
 *     require("@/assets/images/univ/japan/tokyo/waseda.webp"),
 *     require("@/assets/images/univ/japan/tokyo/keio.webp"),
 *     require("@/assets/images/univ/japan/tokyo/meiji.webp"),
 *     require("@/assets/images/univ/japan/tokyo/rikkyo.webp"),
 *     require("@/assets/images/univ/japan/tokyo/chuo.webp"),
 *     require("@/assets/images/univ/japan/osaka/kyoto.webp"),
 *     require("@/assets/images/univ/japan/osaka/osaka.webp"),
 *     require("@/assets/images/univ/japan/osaka/kobe.webp"),
 *     require("@/assets/images/univ/japan/osaka/doshisha.webp"),
 *     require("@/assets/images/univ/japan/osaka/ritsumeikan.webp"),
 *     require("@/assets/images/univ/japan/osaka/kansai.webp"),
 *   ],
 *   row2: [
 *     require("@/assets/images/univ/japan/tokyo/hosei.webp"),
 *     require("@/assets/images/univ/japan/tokyo/hitotsubashi.webp"),
 *     require("@/assets/images/univ/japan/tokyo/sophia.webp"),
 *     require("@/assets/images/univ/japan/tokyo/titech.webp"),
 *     require("@/assets/images/univ/japan/tokyo/tus.webp"),
 *     require("@/assets/images/univ/japan/tokyo/icu.webp"),
 *     require("@/assets/images/univ/japan/nagoya/nagoya.webp"),
 *     require("@/assets/images/univ/japan/nagoya/nit.webp"),
 *     require("@/assets/images/univ/japan/fukuoka/kyushu.webp"),
 *     require("@/assets/images/univ/japan/fukuoka/seinan.webp"),
 *     require("@/assets/images/univ/japan/sapporo/hokkaido.webp"),
 *     require("@/assets/images/univ/japan/sendai/tohoku.webp"),
 *   ],
 * };
 */

export const japanUniversityLogos: UniversityLogoData = {
  row1: [
    require("@/assets/images/univ/japan/TODAI.webp"),
    require("@/assets/images/univ/japan/WASEDA.webp"),
    require("@/assets/images/univ/japan/KEIO.webp"),
    require("@/assets/images/univ/japan/MEIJI.webp"),
    require("@/assets/images/univ/japan/RIKKYO.webp"),
    require("@/assets/images/univ/japan/CHUO.webp"),
    require("@/assets/images/univ/japan/KYODAI.webp"),
    require("@/assets/images/univ/japan/HANDAI.webp"),
    require("@/assets/images/univ/japan/KOBEDAI.webp"),
    require("@/assets/images/univ/japan/DOSHISHA.webp"),
    require("@/assets/images/univ/japan/RITSUMEIKAN.webp"),
    require("@/assets/images/univ/japan/KANSAI.webp"),
  ],
  row2: [
    require("@/assets/images/univ/japan/HOSEI.webp"),
    require("@/assets/images/univ/japan/HITOTSUBASHI.webp"),
    require("@/assets/images/univ/japan/SOPHIA.webp"),
    require("@/assets/images/univ/japan/ICU.webp"),
    require("@/assets/images/univ/japan/TUS.webp"),
    require("@/assets/images/univ/japan/AOYAMA.webp"),
    require("@/assets/images/univ/japan/MEIDAI.webp"),
    require("@/assets/images/univ/japan/KYUDAI.webp"),
    require("@/assets/images/univ/japan/SEINAN.webp"),
    require("@/assets/images/univ/japan/HOKUDAI.webp"),
    require("@/assets/images/univ/japan/TOHOKUDAI.webp"),
    require("@/assets/images/univ/japan/SENSHU.webp"),
  ],
};

/**
 * 일본 대학교 목록 (로고 파일명 참조용)
 */
export const JAPAN_UNIVERSITY_LIST = {
  tokyo: [
    { id: "utokyo", name: "東京大学", nameKo: "도쿄대학" },
    { id: "waseda", name: "早稲田大学", nameKo: "와세다대학" },
    { id: "keio", name: "慶應義塾大学", nameKo: "게이오대학" },
    { id: "meiji", name: "明治大学", nameKo: "메이지대학" },
    { id: "rikkyo", name: "立教大学", nameKo: "릿쿄대학" },
    { id: "chuo", name: "中央大学", nameKo: "츄오대학" },
    { id: "hosei", name: "法政大学", nameKo: "호세이대학" },
    { id: "hitotsubashi", name: "一橋大学", nameKo: "히토츠바시대학" },
    { id: "sophia", name: "上智大学", nameKo: "소피아대학" },
    { id: "titech", name: "東京工業大学", nameKo: "도쿄공업대학" },
    { id: "tus", name: "東京理科大学", nameKo: "도쿄이과대학" },
    { id: "icu", name: "国際基督教大学", nameKo: "ICU" },
  ],
  osaka: [
    { id: "kyoto", name: "京都大学", nameKo: "교토대학" },
    { id: "osaka", name: "大阪大学", nameKo: "오사카대학" },
    { id: "kobe", name: "神戸大学", nameKo: "고베대학" },
    { id: "kansai", name: "関西大学", nameKo: "간사이대학" },
    { id: "doshisha", name: "同志社大学", nameKo: "도시샤대학" },
    { id: "ritsumeikan", name: "立命館大学", nameKo: "리츠메이칸대학" },
  ],
  nagoya: [
    { id: "nagoya", name: "名古屋大学", nameKo: "나고야대학" },
    { id: "nit", name: "名古屋工業大学", nameKo: "나고야공업대학" },
  ],
  fukuoka: [
    { id: "kyushu", name: "九州大学", nameKo: "규슈대학" },
    { id: "seinan", name: "西南学院大学", nameKo: "세이난학원대학" },
  ],
  sapporo: [{ id: "hokkaido", name: "北海道大学", nameKo: "홋카이도대학" }],
  sendai: [{ id: "tohoku", name: "東北大学", nameKo: "도호쿠대학" }],
} as const;
