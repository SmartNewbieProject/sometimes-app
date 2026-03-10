// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: () => [''],
  usePathname: () => '',
  Link: 'Link',
  Stack: 'Stack',
  Tabs: 'Tabs',
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock native analytics modules that ship as ESM/untranspiled packages
jest.mock('mixpanel-react-native', () => ({
  Mixpanel: jest.fn().mockImplementation(() => ({
    init: jest.fn(),
    track: jest.fn(),
    identify: jest.fn(),
    getPeople: jest.fn(() => ({ set: jest.fn() })),
    registerSuperProperties: jest.fn(),
    reset: jest.fn(),
  })),
}));

jest.mock('@mixpanel/react-native-session-replay', () => ({
  MPSessionReplay: {
    initialize: jest.fn(() => Promise.resolve()),
    identify: jest.fn(() => Promise.resolve()),
  },
  MPSessionReplayConfig: jest.fn(),
  MPSessionReplayMask: {
    Text: 'Text',
    Image: 'Image',
  },
}));

jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id'),
}));

jest.mock('expo-av', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Video: (props) => React.createElement(View, props),
    ResizeMode: {
      COVER: 'cover',
      CONTAIN: 'contain',
      STRETCH: 'stretch',
    },
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Set up global environment variables
process.env.EXPO_OS = 'ios';
process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com';
