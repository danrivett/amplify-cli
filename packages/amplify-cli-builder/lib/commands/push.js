'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.run = void 0;
const amplify_cli_core_1 = require('amplify-cli-core');
const amplify_prompts_1 = require('amplify-prompts');
const ora_1 = __importDefault(require('ora'));
const promise_sequential_1 = __importDefault(require('promise-sequential'));
const auth_notifications_1 = require('../extensions/amplify-helpers/auth-notifications');
const get_provider_plugins_1 = require('../extensions/amplify-helpers/get-provider-plugins');
const help_1 = require('./help');
const spinner = (0, ora_1.default)('');
async function syncCurrentCloudBackend(context) {
  context.exeInfo.restoreBackend = false;
  const currentEnv = context.exeInfo.localEnvInfo.envName;
  try {
    const { projectPath } = context.exeInfo.localEnvInfo;
    const amplifyMeta = {};
    const teamProviderInfo = amplify_cli_core_1.stateManager.getTeamProviderInfo(projectPath);
    amplifyMeta.providers = teamProviderInfo[currentEnv];
    const providerPlugins = (0, get_provider_plugins_1.getProviderPlugins)(context);
    const pullCurrentCloudTasks = [];
    context.exeInfo.projectConfig.providers.forEach(provider => {
      const providerModule = require(providerPlugins[provider]);
      pullCurrentCloudTasks.push(() => providerModule.initEnv(context, amplifyMeta.providers[provider]));
    });
    await (0, auth_notifications_1.notifySecurityEnhancement)(context);
    await (0, auth_notifications_1.notifyFieldAuthSecurityChange)(context);
    spinner.start(`Fetching updates to backend environment: ${currentEnv} from the cloud.`);
    await (0, promise_sequential_1.default)(pullCurrentCloudTasks);
    spinner.succeed(`Successfully pulled backend environment ${currentEnv} from the cloud.`);
  } catch (e) {
    spinner.fail(`There was an error pulling the backend environment ${currentEnv}.`);
    throw e;
  }
}
async function pushHooks(context) {
  context.exeInfo.pushHooks = true;
  const providerPlugins = (0, get_provider_plugins_1.getProviderPlugins)(context);
  const pushHooksTasks = [];
  context.exeInfo.projectConfig.providers.forEach(provider => {
    const providerModule = require(providerPlugins[provider]);
    pushHooksTasks.push(() => providerModule.uploadHooksDirectory(context));
  });
  await (0, promise_sequential_1.default)(pushHooksTasks);
}
const run = async context => {
  try {
    context.amplify.constructExeInfo(context);
    if (context.exeInfo.localEnvInfo.noUpdateBackend) {
      throw new amplify_cli_core_1.ConfigurationError('The local environment configuration does not allow backend updates.');
    }
    if (context.parameters.options.force) {
      context.exeInfo.forcePush = true;
    }
    await pushHooks(context);
    await syncCurrentCloudBackend(context);
    return await context.amplify.pushResources(context);
  } catch (e) {
    const message = e.name === 'GraphQLError' ? e.toString() : e.message;
    amplify_prompts_1.printer.error(`An error occurred during the push operation: ${message}`);
    await context.usageData.emitError(e);
    (0, help_1.showTroubleshootingURL)();
    (0, amplify_cli_core_1.exitOnNextTick)(1);
  }
};
exports.run = run;
//# sourceMappingURL=push.js.map
