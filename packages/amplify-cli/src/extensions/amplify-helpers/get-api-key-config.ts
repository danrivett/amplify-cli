import { stateManager } from 'amplify-cli-core';
import { ApiKeyConfig } from '@aws-amplify/graphql-transformer-core';

export function getAppSyncApiConfig(): any {
  const apiConfig = stateManager.getMeta()?.api;
  let appSyncApi;

  Object.keys(apiConfig).forEach(k => {
    if (apiConfig[k]['service'] === 'AppSync') appSyncApi = apiConfig[k];
  });

  return appSyncApi;
}

function getDefaultIfApiKey(): ApiKeyConfig | void {
  const authConfig = getAppSyncApiConfig()?.output?.authConfig;
  const { defaultAuthentication } = authConfig;

  if (defaultAuthentication.authenticationType === 'API_KEY') return defaultAuthentication.apiKeyConfig;
}

function getAdditionalApiKeyConfig(): ApiKeyConfig | void {
  const authConfig = getAppSyncApiConfig()?.output?.authConfig;
  const { additionalAuthenticationProviders } = authConfig;
  let apiKeyConfig;

  additionalAuthenticationProviders.forEach(authProvider => {
    if (authProvider.authenticationType === 'API_KEY') apiKeyConfig = authProvider.apiKeyConfig;
  });

  return apiKeyConfig;
}

export function getApiKeyConfig(): ApiKeyConfig | void {
  return getDefaultIfApiKey() || getAdditionalApiKeyConfig();
}

export function apiKeyIsActive(): boolean {
  const today = new Date();
  const { apiKeyExpirationDate } = getApiKeyConfig() || {};

  if (!apiKeyExpirationDate) return false;

  return new Date(apiKeyExpirationDate) > today;
}

export function hasApiKey(): boolean {
  const apiKeyConfig = getApiKeyConfig();

  return !!apiKeyConfig && !!apiKeyConfig?.apiKeyExpirationDate;
}
