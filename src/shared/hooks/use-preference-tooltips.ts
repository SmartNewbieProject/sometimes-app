import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface TooltipData {
	title: string;
	description: string[];
}

export function usePreferenceTooltips(prefix: string, optionCount: number): TooltipData[] {
	const { t } = useTranslation();
	return useMemo(() => {
		if (optionCount === 0) return [];
		return Array.from({ length: optionCount }, (_, idx) => {
			const title = t(`${prefix}.tooltip_${idx}_title`, {
				defaultValue: t(`${prefix}.tooltip_0_title`),
			});
			const descriptions: string[] = [];
			let descIdx = 1;
			while (true) {
				const desc = t(`${prefix}.tooltip_${idx}_desc_${descIdx}`, { defaultValue: '' });
				if (!desc) break;
				descriptions.push(desc);
				descIdx++;
			}
			return {
				title,
				description: descriptions.length > 0 ? descriptions : [t(`${prefix}.tooltip_0_desc_1`)],
			};
		});
	}, [t, prefix, optionCount]);
}
