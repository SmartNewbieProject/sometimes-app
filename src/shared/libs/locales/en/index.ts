import global from './global.json';
import featuresIdleMatchTimer from './features/idle-match-timer.json';
import featuresOnboarding from './features/onboarding.json';

const features = {
  'idle-match-timer': featuresIdleMatchTimer,
  'onboarding': featuresOnboarding,
};

export default {
  global,
  features,
};
