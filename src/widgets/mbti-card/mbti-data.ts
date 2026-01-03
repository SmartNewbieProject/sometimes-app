import type { MBTIType, MBTIData } from './types';

export const MBTI_DATABASE: Record<MBTIType, MBTIData> = {
  ISTJ: {
    type: 'ISTJ',
    i18nKey: 'widgets.mbti-card.istj',
    compatibility: ['ESFP', 'ESTP'],
    iconPath: 'istj',
  },
  ISTP: {
    type: 'ISTP',
    i18nKey: 'widgets.mbti-card.istp',
    compatibility: ['ESFJ', 'ESTJ'],
    iconPath: 'istp',
  },
  ESTP: {
    type: 'ESTP',
    i18nKey: 'widgets.mbti-card.estp',
    compatibility: ['ESFP', 'ESTP'],
    iconPath: 'estp',
  },
  ESTJ: {
    type: 'ESTJ',
    i18nKey: 'widgets.mbti-card.estj',
    compatibility: ['ISFP', 'INFP'],
    iconPath: 'estj',
  },
  ISFJ: {
    type: 'ISFJ',
    i18nKey: 'widgets.mbti-card.isfj',
    compatibility: ['ESFP', 'ESTP'],
    iconPath: 'isfj',
  },
  ISFP: {
    type: 'ISFP',
    i18nKey: 'widgets.mbti-card.isfp',
    compatibility: ['ESFJ', 'ENFJ'],
    iconPath: 'isfp',
  },
  ESFP: {
    type: 'ESFP',
    i18nKey: 'widgets.mbti-card.esfp',
    compatibility: ['ISTJ', 'ISFJ'],
    iconPath: 'esfp',
  },
  ESFJ: {
    type: 'ESFJ',
    i18nKey: 'widgets.mbti-card.esfj',
    compatibility: ['ESFP', 'ESTP'],
    iconPath: 'esfj',
  },
  INFJ: {
    type: 'INFJ',
    i18nKey: 'widgets.mbti-card.infj',
    compatibility: ['ENFP', 'ENTP'],
    iconPath: 'infj',
  },
  INFP: {
    type: 'INFP',
    i18nKey: 'widgets.mbti-card.infp',
    compatibility: ['ENFJ', 'ENTJ'],
    iconPath: 'infp',
  },
  ENFP: {
    type: 'ENFP',
    i18nKey: 'widgets.mbti-card.enfp',
    compatibility: ['INFJ', 'INTJ'],
    iconPath: 'enfp',
  },
  ENFJ: {
    type: 'ENFJ',
    i18nKey: 'widgets.mbti-card.enfj',
    compatibility: ['INFP', 'ISFP'],
    iconPath: 'enfj',
  },
  INTJ: {
    type: 'INTJ',
    i18nKey: 'widgets.mbti-card.intj',
    compatibility: ['ENFP', 'ENFJ'],
    iconPath: 'intj',
  },
  INTP: {
    type: 'INTP',
    i18nKey: 'widgets.mbti-card.intp',
    compatibility: ['ENTP', 'ENFP'],
    iconPath: 'intp',
  },
  ENTP: {
    type: 'ENTP',
    i18nKey: 'widgets.mbti-card.entp',
    compatibility: ['INFJ', 'INFP'],
    iconPath: 'entp',
  },
  ENTJ: {
    type: 'ENTJ',
    i18nKey: 'widgets.mbti-card.entj',
    compatibility: ['INFP', 'INTP'],
    iconPath: 'entj',
  },
};

export const getMBTIData = (type: MBTIType): MBTIData => {
  return MBTI_DATABASE[type];
};

export const getCompatibleTypes = (type: MBTIType): [MBTIType, MBTIType] => {
  return MBTI_DATABASE[type].compatibility;
};

export const isCompatible = (type1: MBTIType, type2: MBTIType): boolean => {
  const compatibility = MBTI_DATABASE[type1].compatibility;
  return compatibility.includes(type2);
};
