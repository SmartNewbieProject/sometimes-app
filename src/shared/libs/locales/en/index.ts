import global from './global.json';
import notification from './apps/notification.json';
import community from './apps/community.json';
import featuresIdleMatchTimer from './features/idle-match-timer.json';
import featuresOnboarding from './features/onboarding.json';

const apps = {
  notification: notification,
  community: community,
};

const features = {
  'idle-match-timer': featuresIdleMatchTimer,
  'onboarding': featuresOnboarding,
};

export default {
  global,
  apps,
  features,
};
