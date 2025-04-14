const NodeEnvironment = require('jest-environment-node').default;

class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    this.global.process.env = {
      ...this.global.process.env,
      EXPO_PUBLIC_API_URL: 'https://api.example.com',
    };
  }

  async setup() {
    await super.setup();

    // Mock global objects that might be used in React Native
    this.global.fetch = function() {};
    this.global.Headers = function() {};
    this.global.Request = function() {};
    this.global.Response = function() {};
  }

  async teardown() {
    await super.teardown();
  }
}

module.exports = CustomEnvironment;
