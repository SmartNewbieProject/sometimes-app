import auth from './apps/auth.json';
import community from './apps/community.json';
import home from './apps/home.json';
import index from './apps/index.json';
import interest from './apps/interest.json';
import matching_history from './apps/matching_history.json';
import moment from './apps/moment.json';
import myInfo from './apps/my-info.json';
import my from './apps/my.json';
import notification from './apps/notification.json';
import partner from './apps/partner.json';
import postBox from './apps/post-box.json';
import profile_edit from './apps/profile-edit.json';
import purchase from './apps/purchase.json';
import root from './apps/root.json';
import tabs from './apps/tabs.json';
import test from './apps/test.json';
import universityVerification from './apps/university-verification.json';
import featuresAdmin from './features/admin.json';
import featuresAppInstallPrompt from './features/app-install-prompt.json';
import featuresAppleInfo from './features/apple-info.json';
import featuresAuth from './features/auth.json';
import featuresBanReport from './features/ban-report.json';
import featuresCardNews from './features/card-news.json';
import featuresChat from './features/chat.json';
import featuresCommingsoon from './features/commingsoon.json';
import featuresCommunity from './features/community.json';
import featuresContactBlock from './features/contact-block.json';
import featuresEvent from './features/event.json';
import featuresFeedback from './features/feedback.json';
import featuresGuide from './features/guide.json';
import featuresHome from './features/home.json';
import featuresIdleMatchTimer from './features/idle-match-timer.json';
import featuresInstagram from './features/instagram.json';
import featuresInterest from './features/interest.json';
import featuresJpAuth from './features/jp-auth.json';
import featuresJpIdentity from './features/jp-identity.json';
import featuresLikeLetter from './features/like-letter.json';
import featuresLike from './features/like.json';
import featuresLoading from './features/loading.json';
import featuresMatchReasons from './features/match-reasons.json';
import featuresMatch from './features/match.json';
import featuresMatchingHistory from './features/matching-history.json';
import featuresMatching from './features/matching.json';
import featuresMoment from './features/moment.json';
import featuresMyInfo from './features/my-info.json';
import featureMypage from './features/mypage.json';
import featuresOnboarding from './features/onboarding.json';
import featuresPartner from './features/partner.json';
import featuresPass from './features/pass.json';
import featuresPayment from './features/payment.json';
import featuresPostBox from './features/post-box.json';
import featuresPreSignup from './features/pre-signup.json';
import featuresProfileEdit from './features/profile-edit.json';
import featuresSetting from './features/setting.json';
import featuresSignup from './features/signup.json';
import featuresSomemate from './features/somemate.json';
import featuresSupportChat from './features/support-chat.json';
import featuresWelcomeReward from './features/welcome-reward.json';
import global from './global.json';

import widgetsCheckboxLabel from './widgets/checkbox-label.json';
import widgetsForm from './widgets/form.json';
import widgetsGemStore from './widgets/gem-store.json';
import widgetsMbtiCard from './widgets/mbti-card.json';
import widgetsMbtiSelector from './widgets/mbti-selector.json';
import widgetsOppositeGenderPreview from './widgets/opposite-gender-preview.json';
import widgetsPhotoStatusCard from './widgets/photo-status-card.json';
import widgetsPhotoStatusWrapper from './widgets/photo-status-wrapper.json';
import widgetsProfileImageGrid from './widgets/profile-image-grid.json';
import widgetsProfilePhotoCard from './widgets/profile-photo-card.json';
import widgetsRejectedImageWrapper from './widgets/rejected-image-wrapper.json';
import widgetsTicket from './widgets/ticket.json';

import sharedsBusinessInfo from './shareds/business-info.json';
import sharedsContentSelector from './shareds/content-selector.json';
import sharedsHooks from './shareds/hooks.json';
import sharedsImageSelector from './shareds/image-selector.json';
import sharedsLinkifiedText from './shareds/linkified-text.json';
import sharedsNavigation from './shareds/navigation.json';
import sharedsProviders from './shareds/providers.json';
import sharedsSelect from './shareds/select.json';
import sharedsUi from './shareds/ui.json';
import sharedsUtils from './shareds/utils.json';

const apps = {
	auth: auth,
	community: community,
	home: home,
	interest: interest,
	matching_history: matching_history,
	my: my,
	notification: notification,
	partner: partner,
	'my-info': myInfo,
	postBox: postBox,
	profile_edit: profile_edit,
	purchase: purchase,
	tabs: tabs,
	test: test,
	index: index,
	'university-verification': universityVerification,
	moment: moment,
	root: root,
};

const features = {
	admin: featuresAdmin,
	'apple-info': featuresAppleInfo,
	auth: featuresAuth,
	'ban-report': featuresBanReport,
	chat: featuresChat,
	commingsoon: featuresCommingsoon,
	community: featuresCommunity,
	event: featuresEvent,
	feedback: featuresFeedback,
	guide: featuresGuide,
	home: featuresHome,
	instagram: featuresInstagram,
	interest: featuresInterest,
	like: featuresLike,
	loading: featuresLoading,
	match: featuresMatch,
	matching: featuresMatching,
	'matching-history': featuresMatchingHistory,
	'my-info': featuresMyInfo,
	mypage: featureMypage,
	partner: featuresPartner,
	payment: featuresPayment,
	pass: featuresPass,
	'post-box': featuresPostBox,
	'pre-signup': featuresPreSignup,
	'profile-edit': featuresProfileEdit,
	setting: featuresSetting,
	signup: featuresSignup,
	'welcome-reward': featuresWelcomeReward,
	'idle-match-timer': featuresIdleMatchTimer,
	moment: featuresMoment,
	somemate: featuresSomemate,
	onboarding: featuresOnboarding,
	'jp-auth': featuresJpAuth,
	'jp-identity': featuresJpIdentity,
	'card-news': featuresCardNews,
	'app-install-prompt': featuresAppInstallPrompt,
	'like-letter': featuresLikeLetter,
	'match-reasons': featuresMatchReasons,
	'contact-block': featuresContactBlock,
	'support-chat': featuresSupportChat,
};

const widgets = {
	'checkbox-label': widgetsCheckboxLabel,
	form: widgetsForm,
	'gem-store': widgetsGemStore,
	'mbti-card': widgetsMbtiCard,
	'mbti-selector': widgetsMbtiSelector,
	ticket: widgetsTicket,
	'profile-photo-card': widgetsProfilePhotoCard,
	'opposite-gender-preview': widgetsOppositeGenderPreview,
	'photo-status-card': widgetsPhotoStatusCard,
	'photo-status-wrapper': widgetsPhotoStatusWrapper,
	'profile-image-grid': widgetsProfileImageGrid,
	'rejected-image-wrapper': widgetsRejectedImageWrapper,
};

const shareds = {
	'business-info': sharedsBusinessInfo,
	'content-selector': sharedsContentSelector,
	hooks: sharedsHooks,
	'image-selector': sharedsImageSelector,
	'linkified-text': sharedsLinkifiedText,
	navigation: sharedsNavigation,
	providers: sharedsProviders,
	select: sharedsSelect,
	ui: sharedsUi,
	utils: sharedsUtils,
};

export default {
	...global,
	apps,
	features,
	widgets,
	shareds,
};
