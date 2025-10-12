import global from './global.json';
import auth from './apps/auth.json';
import community from './apps/community.json';
import home from './apps/home.json';
import interest from './apps/interest.json';
import matching_history from './apps/matching_history.json';
import my from './apps/my.json';
import partner from './apps/partner.json';
import postBox from './apps/post-box.json';
import profile_edit from './apps/profile-edit.json';
import purchase from './apps/purchase.json';
import tabs from './apps/tabs.json';
import test from './apps/test.json';
import index from './apps/index.json';
import featuresAdmin from './features/admin.json';
import featuresAppleInfo from './features/apple-info.json';
import featuresAuth from './features/auth.json';
import featuresBanReport from './features/ban-report.json';
import featuresChat from './features/chat.json';
import featuresCommingsoon from './features/commingsoon.json';
import featuresCommunity from './features/community.json';
import featuresEvent from './features/event.json';
import featuresFeedback from './features/feedback.json';
import featuresGuide from './features/guide.json';
import featuresHome from './features/home.json';
import featuresInterest from './features/interest.json';
import featuresLike from './features/like.json';
import featuresLoading from './features/loading.json';
import featuresMatch from './features/match.json';
import featuresMatchingHistory from './features/matching-history.json';
import featuresMyInfo from './features/my-info.json';
import featuresPartner from './features/partner.json';
import featuresPayment from './features/payment.json';
import featuresPostBox from './features/post-box.json';
import featuresPreSignup from './features/pre-signup.json';
import featuresProfileEdit from './features/profile-edit.json';
import featuresSetting from './features/setting.json';
import featuresSignup from './features/signup.json';
import featuresWelcomeReward from './features/welcome-reward.json';
import featuresIdleMatchTimer from './features/idle-match-timer.json';
import featureMypage from './features/mypage.json';


import widgetsCheckboxLabel from './widgets/checkbox-label.json';
import widgetsForm from './widgets/form.json';
import widgetsGemStore from './widgets/gem-store.json';
import widgetsMbtiSelector from './widgets/mbti-selector.json';
import widgetsTicket from './widgets/ticket.json';

import sharedsBusinessInfo from './shareds/business-info.json';
import sharedsContentSelector from './shareds/content-selector.json';
import sharedsHooks from './shareds/hooks.json';
import sharedsImageSelector from './shareds/image-selector.json';
import sharedsLinkifiedText from './shareds/linkified-text.json';
import sharedsNavigation from './shareds/navigation.json';
import sharedsProviders from './shareds/providers.json';
import sharedsSelect from './shareds/select.json';
import sharedsUtils from './shareds/utils.json';

const apps = {
  auth: auth,
  community: community,
  home: home,
  interest: interest,
  matching_history: matching_history,
  my: my,
  partner: partner,
  postBox: postBox,
  profile_edit: profile_edit,
  purchase: purchase,
  tabs: tabs,
  test: test,
  index: index,
}

const features = {
  'admin': featuresAdmin,
  'apple-info': featuresAppleInfo,
  'auth': featuresAuth,
  'ban-report': featuresBanReport,
  'chat': featuresChat,
  'commingsoon': featuresCommingsoon,
  'community': featuresCommunity,
  'event': featuresEvent,
  'feedback': featuresFeedback,
  'guide': featuresGuide,
  'home': featuresHome,
  'interest': featuresInterest,
  'like': featuresLike,
  'loading': featuresLoading,
  'match': featuresMatch,
  'matching-history': featuresMatchingHistory,
  'my-info': featuresMyInfo,
  'mypage': featureMypage,
  'partner': featuresPartner,
  'payment': featuresPayment,
  'post-box': featuresPostBox,
  'pre-signup': featuresPreSignup,
  'profile-edit': featuresProfileEdit,
  'setting': featuresSetting,
  'signup': featuresSignup,
  'welcome-reward': featuresWelcomeReward,
  'idle-match-timer': featuresIdleMatchTimer,
};

const widgets = {
  'checkbox-label': widgetsCheckboxLabel,
  'form': widgetsForm,
  'gem-store': widgetsGemStore,
  'mbti-selector': widgetsMbtiSelector,
  'ticket': widgetsTicket,
};

const shareds = {
  'business-info': sharedsBusinessInfo,
  'content-selector': sharedsContentSelector,
  'hooks': sharedsHooks,
  'image-selector': sharedsImageSelector,
  'linkified-text': sharedsLinkifiedText,
  'navigation': sharedsNavigation,
  'providers': sharedsProviders,
  'select': sharedsSelect,
  'utils': sharedsUtils,
};

export default {
  global,
  apps,
  features,
  widgets,
  shareds,
};