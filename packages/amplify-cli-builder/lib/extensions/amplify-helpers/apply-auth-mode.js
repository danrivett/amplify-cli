'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.checkIfAuthExists = exports.handleValidGraphQLAuthError = exports.isValidGraphQLAuthError = void 0;
const get_project_meta_1 = require('./get-project-meta');
const errAuthMissingIAM = `@auth directive with 'iam' provider found, but the project has no IAM authentication provider configured.`;
const errAuthMissingUserPools = `@auth directive with 'userPools' provider found, but the project has no Cognito User Pools authentication provider configured.`;
const errAuthMissingOIDC = `@auth directive with 'oidc' provider found, but the project has no OPENID_CONNECT authentication provider configured.`;
const errAuthMissingApiKey = `@auth directive with 'apiKey' provider found, but the project has no API Key authentication provider configured.`;
const errAuthMissingLambda = `@auth directive with 'function' provider found, but the project has no Lambda authentication provider configured.`;
function isValidGraphQLAuthError(message) {
  return [errAuthMissingIAM, errAuthMissingUserPools, errAuthMissingOIDC, errAuthMissingApiKey, errAuthMissingLambda].includes(message);
}
exports.isValidGraphQLAuthError = isValidGraphQLAuthError;
async function handleValidGraphQLAuthError(context, message) {
  var _a, _b;
  if (message === errAuthMissingIAM) {
    await addGraphQLAuthRequirement(context, 'AWS_IAM');
    return true;
  } else if (checkIfAuthExists() && message === errAuthMissingUserPools) {
    await addGraphQLAuthRequirement(context, 'AMAZON_COGNITO_USER_POOLS');
    return true;
  } else if (
    !((_b = (_a = context === null || context === void 0 ? void 0 : context.parameters) === null || _a === void 0 ? void 0 : _a.options) ===
      null || _b === void 0
      ? void 0
      : _b.yes)
  ) {
    if (message === errAuthMissingUserPools) {
      await addGraphQLAuthRequirement(context, 'AMAZON_COGNITO_USER_POOLS');
      return true;
    } else if (message === errAuthMissingOIDC) {
      await addGraphQLAuthRequirement(context, 'OPENID_CONNECT');
      return true;
    } else if (message === errAuthMissingApiKey) {
      await addGraphQLAuthRequirement(context, 'API_KEY');
      return true;
    } else if (message === errAuthMissingLambda) {
      await addGraphQLAuthRequirement(context, 'AWS_LAMBDA');
      return true;
    }
  }
  return false;
}
exports.handleValidGraphQLAuthError = handleValidGraphQLAuthError;
async function addGraphQLAuthRequirement(context, authType) {
  return await context.amplify.invokePluginMethod(context, 'api', undefined, 'addGraphQLAuthorizationMode', [
    context,
    {
      authType: authType,
      printLeadText: true,
      authSettings: undefined,
    },
  ]);
}
function checkIfAuthExists() {
  const amplifyMeta = (0, get_project_meta_1.getProjectMeta)();
  let authExists = false;
  const authServiceName = 'Cognito';
  const authCategory = 'auth';
  const categoryResources = amplifyMeta[authCategory];
  if (categoryResources !== null && typeof categoryResources === 'object') {
    authExists = Object.keys(categoryResources).some(resource => categoryResources[resource].service === authServiceName);
  }
  return authExists;
}
exports.checkIfAuthExists = checkIfAuthExists;
//# sourceMappingURL=apply-auth-mode.js.map
