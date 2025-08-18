import { getRegionCodeByName } from '@/src/shared/constants/region';

export const areaMap = [
	{
		id: 1,
		area: '대전',
		location: {
			top: 184,
			left: 88,
		},
		modalLocation: {
			top: 184,
			left: 112,
		},
		description: '22개 대학 오픈 완료!',
		open: 'open',
	},
	{
		id: 2,
		area: '부산',
		location: {
			top: 274,
			right: 25,
		},
		modalLocation: {
			top: 274,
			right: 45,
		},
		description: '28개 대학 오픈 완료!',
		open: 'open',
	},
	{
		id: 3,
		area: '대구',
		location: {
			top: 220,
			right: 58,
		},
		modalLocation: {
			top: 220,
			right: 82,
		},
		description: '32개 대학 오픈 완료!',

		open: 'open',
	},
	{
		id: 4,
		area: '충북/세종',
		location: {
			top: 153,
			left: 100,
		},
		modalLocation: {
			top: 153,
			left: 124,
		},
		open: 'open',
		description: '11개 대학 오픈 완료!',
	},
	{
		id: 5,
		area: '경북',
		location: {
			top: 225,
			right: 10,
		},
		modalLocation: {
			top: 225,
			right: 40,
		},
		open: 'close',
		description: '오픈 준비 중',
	},
	{
		id: 6,
		area: '경남',
		location: {
			top: 294,
			right: 94,
		},
		modalLocation: {
			top: 294,
			right: 118,
		},
		open: 'close',
		description: '오픈 준비 중',
	},
	{
		id: 7,
		area: '전북',
		location: {
			top: 235,
			left: 76,
		},
		modalLocation: {
			top: 235,
			left: 100,
		},
		open: 'close',
		description: '오픈 준비 중',
	},
	{
		id: 8,
		area: '전남',
		location: {
			top: 328,
			left: 58,
		},
		modalLocation: {
			top: 328,
			left: 82,
		},
		description: '오픈 준비 중',

		open: 'close',
	},
	{
		id: 9,
		area: '서울',
		location: {
			top: 80,
			left: 72,
		},
		modalLocation: {
			top: 80,
			left: 96,
		},
		open: 'close',
		description: '오픈 준비 중',
	},
	{
		id: 10,
		area: '경기',
		location: {
			top: 110,
			left: 88,
		},
		modalLocation: {
			top: 100,
			left: 112,
		},
		open: 'close',
		description: '오픈 준비 중',
	},
	{
		id: 11,
		area: '강원',
		location: {
			top: 84,
			right: 78,
		},
		modalLocation: {
			top: 84,
			right: 102,
		},
		open: 'close',
		description: '오픈 준비 중',
	},
] as const;

export function getRegionList(area: string) {
	switch (area) {
		case '대전':
			return [getRegionCodeByName('대전광역시')];
		case '부산':
			return [getRegionCodeByName('부산광역시'), getRegionCodeByName('김해시')];
		case '대구':
			return [getRegionCodeByName('대구광역시')];
		case '충북/세종':
			return [getRegionCodeByName('청주시'), getRegionCodeByName('세종특별자치시')];
		default:
			return [];
	}
}
