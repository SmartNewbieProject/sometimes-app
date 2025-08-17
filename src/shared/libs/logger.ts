import { logger as factory } from 'react-native-logs';

const logger = factory.createLogger({
  severity: 'debug',
  async: true,
  enabled: true,
});

export default logger;
