import React from 'react';
import { useTranslation } from 'react-i18next';
import { CharacterPromptModal } from '@/src/shared/ui';

interface UniversityCertificationPromptModalProps {
	visible: boolean;
	onClose: () => void;
	onCertify: () => void;
	onLater: () => void;
}

export const UniversityCertificationPromptModal: React.FC<
	UniversityCertificationPromptModalProps
> = ({ visible, onClose, onCertify, onLater }) => {
	const { t } = useTranslation();

	return (
		<CharacterPromptModal
			visible={visible}
			onClose={onClose}
			title={t('features.event.ui.university_certification_prompt.title')}
			subtitle={t('features.event.ui.university_certification_prompt.subtitle')}
			rewardText={t('features.event.ui.university_certification_prompt.benefit_text')}
			rewardSubtext={t('features.event.ui.university_certification_prompt.reward_subtext')}
			primaryButtonText={t('features.event.ui.university_certification_prompt.certify_button')}
			secondaryButtonText={t('features.event.ui.university_certification_prompt.later_button')}
			onPrimary={onCertify}
			onSecondary={onLater}
			animationDuration={200}
			animationDelay={100}
			springDamping={12}
			springStiffness={250}
		/>
	);
};
