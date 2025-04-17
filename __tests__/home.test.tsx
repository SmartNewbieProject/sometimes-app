import React from 'react';
import HomeScreen from '../app/home/index';

// Mock the router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
  usePathname: jest.fn(() => '/home'),
}));

// Mock the Image component from expo-image
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props: any) => <View {...props} testID="expo-image" />,
  };
});

// Mock SVG components
jest.mock('@/assets/icons/small-title.svg', () => 'SmallTitle');

describe('HomeScreen', () => {
  it('renders without crashing', () => {
    // Just check if the component can be created without errors
    expect(() => <HomeScreen />).not.toThrow();
  });
});
