import community from './apps/community.json';
import interest from './apps/interest.json';
import moment from './apps/moment.json';
import notification from './apps/notification.json';
import partner from './apps/partner.json';
import purchase from './apps/purchase.json';
import root from './apps/root.json';
import featuresContactBlock from './features/contact-block.json';
import featuresIdealTypeTest from './features/ideal-type-test.json';
import featuresIdleMatchTimer from './features/idle-match-timer.json';
import featuresInAppReview from './features/in-app-review.json';
import featuresInstagram from './features/instagram.json';
import featuresLikeLetter from './features/like-letter.json';
import featuresLoading from './features/loading.json';
import featuresOnboarding from './features/onboarding.json';
import featuresProfileViewer from './features/profile-viewer.json';
import global from './global.json';
import sharedsUi from './shareds/ui.json';
import widgetsGemStore from './widgets/gem-store.json';
import widgetsOppositeGenderPreview from './widgets/opposite-gender-preview.json';
import widgetsPhotoStatusCard from './widgets/photo-status-card.json';
import widgetsPhotoStatusWrapper from './widgets/photo-status-wrapper.json';
import widgetsRejectedImageWrapper from './widgets/rejected-image-wrapper.json';

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
	'ideal-type-test': featuresIdealTypeTest,
	'idle-match-timer': featuresIdleMatchTimer,
	instagram: featuresInstagram,
	loading: featuresLoading,
	onboarding: featuresOnboarding,
	'in-app-review': featuresInAppReview,
	'contact-block': featuresContactBlock,
	'like-letter': featuresLikeLetter,
	'profile-viewer': featuresProfileViewer,
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
