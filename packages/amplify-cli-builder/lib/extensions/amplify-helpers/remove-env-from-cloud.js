'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.removeEnvFromCloud = void 0;
const get_project_config_1 = require('./get-project-config');
const get_all_category_pluginInfos_1 = require('./get-all-category-pluginInfos');
const get_provider_plugins_1 = require('./get-provider-plugins');
const execution_manager_1 = require('../../execution-manager');
async function removeEnvFromCloud(context, envName, deleteS3) {
  const { providers } = (0, get_project_config_1.getProjectConfig)();
  const providerPlugins = (0, get_provider_plugins_1.getProviderPlugins)(context);
  const providerPromises = [];
  context.print.info('');
  context.print.info(`Deleting env: ${envName}.`);
  const categoryPluginInfoList = (0, get_all_category_pluginInfos_1.getAllCategoryPluginInfo)(context);
  if (categoryPluginInfoList.notifications) {
    const notificationsModule = require(categoryPluginInfoList.notifications[0].packageLocation);
    await notificationsModule.deletePinpointAppForEnv(context, envName);
  }
  providers.forEach(providerName => {
    const pluginModule = require(providerPlugins[providerName]);
    providerPromises.push(pluginModule.deleteEnv(context, envName, deleteS3));
  });
  try {
    await Promise.all(providerPromises);
    await (0, execution_manager_1.raiseIntenralOnlyPostEnvRemoveEvent)(context, envName);
  } catch (e) {
    context.print.info('');
    context.print.error(`Error occurred while deleting env: ${envName}.`);
    context.print.info(e.message);
    if (e.code !== 'NotFoundException') {
      throw e;
    }
  }
}
exports.removeEnvFromCloud = removeEnvFromCloud;
//# sourceMappingURL=remove-env-from-cloud.js.map
