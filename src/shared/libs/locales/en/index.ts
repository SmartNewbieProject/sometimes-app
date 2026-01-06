import global from './global.json';
import notification from './apps/notification.json';
import community from './apps/community.json';
import moment from './apps/moment.json';
import root from './apps/root.json';
import purchase from './apps/purchase.json';
import interest from './apps/interest.json';
import partner from './apps/partner.json';
import featuresIdleMatchTimer from './features/idle-match-timer.json';
import featuresOnboarding from './features/onboarding.json';
import featuresInAppReview from './features/in-app-review.json';
import featuresContactBlock from './features/contact-block.json';
import sharedsUi from './shareds/ui.json';
import widgetsOppositeGenderPreview from './widgets/opposite-gender-preview.json';
import widgetsPhotoStatusCard from './widgets/photo-status-card.json';
import widgetsPhotoStatusWrapper from './widgets/photo-status-wrapper.json';
import widgetsRejectedImageWrapper from './widgets/rejected-image-wrapper.json';
import widgetsGemStore from './widgets/gem-store.json';

const apps = {
	notification: notification,
	community: community,
	moment: moment,
	root: root,
	purchase: purchase,
	interest: interest,
	partner: partner,
};

const features = {
	'idle-match-timer': featuresIdleMatchTimer,
	onboarding: featuresOnboarding,
	'in-app-review': featuresInAppReview,
	'contact-block': featuresContactBlock,
};

const shareds = {
	ui: sharedsUi,
};

const widgets = {
	'opposite-gender-preview': widgetsOppositeGenderPreview,
	'photo-status-card': widgetsPhotoStatusCard,
	'photo-status-wrapper': widgetsPhotoStatusWrapper,
	'rejected-image-wrapper': widgetsRejectedImageWrapper,
	'gem-store': widgetsGemStore,
};

export default {
	global,
	apps,
	features,
	shareds,
	widgets,
};
