export enum UniversityName {
  배재대학교 = "배재대학교",
  충남대학교 = "충남대학교",
  대전보건대학교 = "대전보건대학교",
  대전대학교 = "대전대학교",
  한밭대학교 = "한밭대학교",
  한남대학교 = "한남대학교",
  건양대학교메디컬캠퍼스 = "건양대학교 메디컬캠퍼스",
  건양대학교창의융합캠퍼스 = "건양대학교 창의융합캠퍼스",
  목원대학교 = "목원대학교",
  을지대학교 = "을지대학교",
  우송대학교 = "우송대학교",
  고려대학교세종캠퍼스 = "고려대학교 세종캠퍼스",
  홍익대학교세종캠퍼스 = "홍익대학교 세종캠퍼스",
  한국교원대학교 = "한국교원대학교",
  공주대학교 = "공주대학교",
  공주교육대학교 = "공주교육대학교",
  충북대학교 = "충북대학교",
  청주교육대학교 = "청주교육대학교",
  경성대학교 = "경성대학교",
  고신대학교 = "고신대학교",
  부경대학교 = "부경대학교",
  한국해양대학교 = "한국해양대학교",
  동명대학교 = "동명대학교",
  동서대학교 = "동서대학교",
  동아대학교 = "동아대학교",
  동의대학교 = "동의대학교",
  부산가톨릭대학교 = "부산가톨릭대학교",
  부산교육대학교 = "부산교육대학교",
  부산대학교 = "부산대학교",
}

const UniversityImage: Record<UniversityName, string> = {
  [UniversityName.배재대학교]: "bju.png",
  [UniversityName.충남대학교]: "cnu.png",
  [UniversityName.대전보건대학교]: "dbu.png",
  [UniversityName.대전대학교]: "ddu.png",
  [UniversityName.한밭대학교]: "hbu.png",
  [UniversityName.한남대학교]: "hnu.png",
  [UniversityName.건양대학교메디컬캠퍼스]: "kyu.png",
  [UniversityName.건양대학교창의융합캠퍼스]: "kyu.png",
  [UniversityName.목원대학교]: "mwu.png",
  [UniversityName.을지대학교]: "uju.png",
  [UniversityName.우송대학교]: "wsu.png",
  [UniversityName.고려대학교세종캠퍼스]: "kau.png",
  [UniversityName.홍익대학교세종캠퍼스]: "hiu.png",
  [UniversityName.한국교원대학교]: "knu.png",
  [UniversityName.공주대학교]: "kgu.png",
  [UniversityName.공주교육대학교]: "keu.png",
  [UniversityName.충북대학교]: "cbu.png",
  [UniversityName.청주교육대학교]: "ceu.png",
  [UniversityName.경성대학교]: "ks.png",
  [UniversityName.고신대학교]: "kosin.png",
  [UniversityName.부경대학교]: "pukyong.png",
  [UniversityName.한국해양대학교]: "kmou.png",
  [UniversityName.동명대학교]: "tu.png",
  [UniversityName.동서대학교]: "dongseo.png",
  [UniversityName.동아대학교]: "donga.png",
  [UniversityName.동의대학교]: "deu.png",
  [UniversityName.부산가톨릭대학교]: "cup.png",
  [UniversityName.부산교육대학교]: "bnue.png",
  [UniversityName.부산대학교]: "pusan.png",
};

const baseUrl = 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/univ/';

const createImageUrl = (univ: UniversityName) => `${baseUrl}${UniversityImage[univ]}`;

export const getUnivLogo = (univ: UniversityName) => createImageUrl(univ);
