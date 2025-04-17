module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }]
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@hooks/(.*)$': '<rootDir>/src/shared/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/shared/utils/$1',
    '^@constants/(.*)$': '<rootDir>/src/shared/constants/$1',
    '^@ui/(.*)$': '<rootDir>/src/shared/ui/$1',
    '^@entities/(.*)$': '<rootDir>/src/entities/$1',
    '^@widgets/(.*)$': '<rootDir>/src/widgets/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
