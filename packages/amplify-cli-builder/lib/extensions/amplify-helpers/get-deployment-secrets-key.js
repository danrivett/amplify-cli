'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getDeploymentSecretsKey = void 0;
const amplify_cli_core_1 = require('amplify-cli-core');
const uuid_1 = require('uuid');
const lodash_1 = __importDefault(require('lodash'));
const prePushKeyName = 'prePushDeploymentSecretsKey';
function getDeploymentSecretsKey() {
  var _a, _b;
  const teamProviderInfo = amplify_cli_core_1.stateManager.getTeamProviderInfo();
  const { envName } = amplify_cli_core_1.stateManager.getLocalEnvInfo();
  const envTeamProviderInfo = teamProviderInfo[envName];
  const prePushKey =
    (_a = envTeamProviderInfo === null || envTeamProviderInfo === void 0 ? void 0 : envTeamProviderInfo.awscloudformation) === null ||
    _a === void 0
      ? void 0
      : _a[prePushKeyName];
  if (prePushKey) {
    return prePushKey;
  }
  const stackId =
    (_b = envTeamProviderInfo === null || envTeamProviderInfo === void 0 ? void 0 : envTeamProviderInfo.awscloudformation) === null ||
    _b === void 0
      ? void 0
      : _b.StackId;
  if (typeof stackId === 'string') {
    return stackId.split('/')[2];
  }
  const newKey = (0, uuid_1.v4)();
  lodash_1.default.set(teamProviderInfo, [envName, 'awscloudformation', prePushKeyName], newKey);
  amplify_cli_core_1.stateManager.setTeamProviderInfo(undefined, teamProviderInfo);
  return newKey;
}
exports.getDeploymentSecretsKey = getDeploymentSecretsKey;
//# sourceMappingURL=get-deployment-secrets-key.js.map
