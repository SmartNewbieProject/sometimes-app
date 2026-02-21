import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import type { Config } from './types.js';

const ssm = new SSMClient({});
const ssmCache = new Map<string, string>();

async function getSSMParameter(name: string): Promise<string> {
  const cached = ssmCache.get(name);
  if (cached) return cached;

  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  });
  const result = await ssm.send(command);
  const value = result.Parameter?.Value;
  if (!value) throw new Error(`SSM parameter not found: ${name}`);

  ssmCache.set(name, value);
  return value;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

export async function loadConfig(): Promise<Config> {
  const ssmPrefix = requireEnv('SSM_PREFIX');

  const [
    appStoreKeyId,
    appStoreIssuerId,
    appStorePrivateKey,
    playStoreServiceAccountJson,
    slackBotToken,
  ] = await Promise.all([
    getSSMParameter(`${ssmPrefix}/app-store/key-id`),
    getSSMParameter(`${ssmPrefix}/app-store/issuer-id`),
    getSSMParameter(`${ssmPrefix}/app-store/private-key`),
    getSSMParameter(`${ssmPrefix}/play-store/service-account-json`),
    getSSMParameter(`${ssmPrefix}/slack/bot-token`),
  ]);

  return {
    tableName: requireEnv('TABLE_NAME'),
    slackChannel: requireEnv('SLACK_CHANNEL'),
    appStoreAppId: requireEnv('APP_STORE_APP_ID'),
    playStorePackageName: requireEnv('PLAY_STORE_PACKAGE_NAME'),
    migrationMode: process.env.MIGRATION_MODE === 'true',
    appStoreKeyId,
    appStoreIssuerId,
    appStorePrivateKey,
    playStoreServiceAccountJson,
    slackBotToken,
  };
}
