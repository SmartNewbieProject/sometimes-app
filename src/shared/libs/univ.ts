export enum UniversityName {
  배재대학교 = "배재대학교",
  충남대학교 = "충남대학교",
  대전보건대학교 = "대전보건대학교",
  대전대학교 = "대전대학교",
  한밭대학교 = "한밭대학교",
  한남대학교 = "한남대학교",
  건양대학교 = "건양대학교",
  목원대학교 = "목원대학교",
  을지대학교 = "을지대학교",
  우송대학교 = "우송대학교",
}

const UniversityImage: Record<UniversityName, string> = {
  [UniversityName.배재대학교]: "bju.png",
  [UniversityName.충남대학교]: "cnu.png",
  [UniversityName.대전보건대학교]: "dbu.png",
  [UniversityName.대전대학교]: "ddu.png",
  [UniversityName.한밭대학교]: "hbu.png",
  [UniversityName.한남대학교]: "hnu.png",
  [UniversityName.건양대학교]: "kyu.png",
  [UniversityName.목원대학교]: "mwu.png",
  [UniversityName.을지대학교]: "uju.png",
  [UniversityName.우송대학교]: "wsu.png",
};

const baseUrl = 'https://sometimes-resources.s3.ap-northeast-2.amazonaws.com/univ/';

const createImageUrl = (univ: UniversityName) => `${baseUrl}${UniversityImage[univ]}`;

export const getUnivLogo = (univ: UniversityName) => createImageUrl(univ);
