'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.storeCurrentCloudBackend = exports.pushResources = void 0;
const amplify_cli_core_1 = require('amplify-cli-core');
const build_1 = require('../../commands/build');
const initialize_env_1 = require('../../initialize-env');
const get_env_info_1 = require('./get-env-info');
const get_project_config_1 = require('./get-project-config');
const get_provider_plugins_1 = require('./get-provider-plugins');
const on_category_outputs_change_1 = require('./on-category-outputs-change');
const resource_status_1 = require('./resource-status');
const amplify_category_custom_1 = require('@aws-amplify/amplify-category-custom');
const apply_auth_mode_1 = require('./apply-auth-mode');
const amplify_prompts_1 = require('amplify-prompts');
async function pushResources(context, category, resourceName, filteredResources, rebuild = false) {
  if (context.parameters.options['iterative-rollback']) {
    if (context.parameters.options.force) {
      throw new Error(
        "'--iterative-rollback' and '--force' cannot be used together. Consider runnning 'amplify push --force' to iteratively rollback and redeploy.",
      );
    }
    context.exeInfo.iterativeRollback = true;
  }
  if (context.parameters.options.env) {
    const envName = context.parameters.options.env;
    const allEnvs = context.amplify.getAllEnvs();
    if (allEnvs.findIndex(env => env === envName) !== -1) {
      context.exeInfo = {};
      context.exeInfo.forcePush = false;
      context.exeInfo.projectConfig = amplify_cli_core_1.stateManager.getProjectConfig(undefined, {
        throwIfNotExist: false,
      });
      context.exeInfo.localEnvInfo = (0, get_env_info_1.getEnvInfo)();
      if (context.exeInfo.localEnvInfo.envName !== envName) {
        context.exeInfo.localEnvInfo.envName = envName;
        amplify_cli_core_1.stateManager.setLocalEnvInfo(context.exeInfo.localEnvInfo.projectPath, context.exeInfo.localEnvInfo);
      }
      await (0, initialize_env_1.initializeEnv)(context);
    } else {
      const errMessage = "Environment doesn't exist. Please use 'amplify init' to create a new environment";
      context.print.error(errMessage);
      await context.usageData.emitError(new amplify_cli_core_1.EnvironmentDoesNotExistError(errMessage));
      (0, amplify_cli_core_1.exitOnNextTick)(1);
    }
  }
  await (0, amplify_category_custom_1.generateDependentResourcesType)(context);
  const resourcesToBuild = await (0, build_1.getResources)(context);
  await context.amplify.executeProviderUtils(context, 'awscloudformation', 'buildOverrides', {
    resourcesToBuild,
    forceCompile: true,
  });
  let hasChanges = false;
  if (!rebuild) {
    hasChanges = !!(await (0, resource_status_1.showResourceTable)(category, resourceName, filteredResources));
  }
  if (!hasChanges && !context.exeInfo.forcePush && !rebuild) {
    context.print.info('\nNo changes detected');
    return context;
  }
  let continueToPush = (context.exeInfo && context.exeInfo.inputParams && context.exeInfo.inputParams.yes) || rebuild;
  if (!continueToPush) {
    if (context.exeInfo.iterativeRollback) {
      context.print.info('The CLI will rollback the last known iterative deployment.');
    }
    continueToPush = await context.amplify.confirmPrompt('Are you sure you want to continue?');
  }
  let retryPush;
  if (continueToPush) {
    do {
      retryPush = false;
      try {
        const currentAmplifyMeta = amplify_cli_core_1.stateManager.getCurrentMeta();
        await providersPush(context, rebuild, category, resourceName, filteredResources);
        await (0, on_category_outputs_change_1.onCategoryOutputsChange)(context, currentAmplifyMeta);
      } catch (err) {
        const isAuthError = (0, apply_auth_mode_1.isValidGraphQLAuthError)(err.message);
        if (isAuthError) {
          retryPush = await (0, apply_auth_mode_1.handleValidGraphQLAuthError)(context, err.message);
        }
        if (!retryPush) {
          if (isAuthError) {
            amplify_prompts_1.printer.warn(
              `You defined authorization rules (@auth) but haven't enabled their authorization providers on your GraphQL API. Run "amplify update api" to configure your GraphQL API to include the appropriate authorization providers as an authorization mode.`,
            );
            amplify_prompts_1.printer.error(err.message);
          }
          throw err;
        }
      }
    } while (retryPush);
  } else {
    (0, amplify_cli_core_1.exitOnNextTick)(1);
  }
  return continueToPush;
}
exports.pushResources = pushResources;
async function providersPush(context, rebuild = false, category, resourceName, filteredResources) {
  const { providers } = (0, get_project_config_1.getProjectConfig)();
  const providerPlugins = (0, get_provider_plugins_1.getProviderPlugins)(context);
  const providerPromises = [];
  for (const provider of providers) {
    const providerModule = require(providerPlugins[provider]);
    const resourceDefinition = await context.amplify.getResourceStatus(category, resourceName, provider, filteredResources);
    providerPromises.push(providerModule.pushResources(context, resourceDefinition, rebuild));
  }
  await Promise.all(providerPromises);
}
async function storeCurrentCloudBackend(context) {
  const { providers } = (0, get_project_config_1.getProjectConfig)();
  const providerPlugins = (0, get_provider_plugins_1.getProviderPlugins)(context);
  const providerPromises = [];
  for (const provider of providers) {
    const providerModule = require(providerPlugins[provider]);
    providerPromises.push(providerModule.storeCurrentCloudBackend(context));
  }
  await Promise.all(providerPromises);
}
exports.storeCurrentCloudBackend = storeCurrentCloudBackend;
//# sourceMappingURL=push-resources.js.map
