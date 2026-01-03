export const JP_LEGAL_LINKS = {
  termsOfService: 'https://www.notion.so/20d1bbec5ba18084bf71effa8b1e861f',
  privacyCollection: 'https://www.notion.so/2cc1bbec5ba180f68b9ceb9e1deec144',
  ageVerification: 'https://www.notion.so/2cc1bbec5ba18042ab04c145f2518316',
  privacyPolicy: 'https://www.notion.so/SOMETIME-2cc1bbec5ba180008621d677c167ff0b',
  commercialLaw: 'https://www.notion.so/2cc1bbec5ba180808bc4c7322f31fc40',
  ageConfirmation: 'https://www.notion.so/2cc1bbec5ba18022a29ed290fa699512',
} as const;

export type JpLegalLinkKey = keyof typeof JP_LEGAL_LINKS;
