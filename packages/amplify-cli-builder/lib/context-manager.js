'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod) if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.attachUsageData = exports.constructContext = void 0;
const amplify_cli_core_1 = require('amplify-cli-core');
const app_config_1 = require('./app-config');
const context_extensions_1 = require('./context-extensions');
const amplify_usageData_1 = require('./domain/amplify-usageData');
const context_1 = require('./domain/context');
const _ = __importStar(require('lodash'));
function constructContext(pluginPlatform, input) {
  const context = new context_1.Context(pluginPlatform, input);
  (0, context_extensions_1.attachExtentions)(context);
  return context;
}
exports.constructContext = constructContext;
async function attachUsageData(context) {
  const { AMPLIFY_CLI_ENABLE_USAGE_DATA } = process.env;
  const config = (0, app_config_1.init)(context);
  const usageTrackingEnabled = AMPLIFY_CLI_ENABLE_USAGE_DATA
    ? AMPLIFY_CLI_ENABLE_USAGE_DATA === 'true'
    : config.usageDataConfig.isUsageTrackingEnabled;
  if (usageTrackingEnabled) {
    context.usageData = amplify_usageData_1.UsageData.Instance;
  } else {
    context.usageData = amplify_usageData_1.NoUsageData.Instance;
  }
  const accountId = getSafeAccountId();
  context.usageData.init(config.usageDataConfig.installationUuid, getVersion(context), context.input, accountId, getProjectSettings());
}
exports.attachUsageData = attachUsageData;
const getSafeAccountId = () => {
  if (amplify_cli_core_1.stateManager.metaFileExists()) {
    const amplifyMeta = amplify_cli_core_1.stateManager.getMeta();
    const stackId = _.get(amplifyMeta, ['providers', 'awscloudformation', 'StackId']);
    if (stackId) {
      const splitString = stackId.split(':');
      if (splitString.length > 4) {
        return splitString[4];
      }
    }
  }
  return '';
};
const getVersion = context => context.pluginPlatform.plugins.core[0].packageVersion;
const getProjectSettings = () => {
  var _a;
  const projectSettings = {};
  if (amplify_cli_core_1.stateManager.projectConfigExists()) {
    const projectConfig = amplify_cli_core_1.stateManager.getProjectConfig();
    const frontend = projectConfig.frontend;
    projectSettings.frontend = frontend;
    projectSettings.framework =
      (_a = projectConfig === null || projectConfig === void 0 ? void 0 : projectConfig[frontend]) === null || _a === void 0
        ? void 0
        : _a.framework;
  }
  if (amplify_cli_core_1.stateManager.localEnvInfoExists()) {
    const { defaultEditor } = amplify_cli_core_1.stateManager.getLocalEnvInfo();
    projectSettings.editor = defaultEditor;
  }
  return projectSettings;
};
//# sourceMappingURL=context-manager.js.map
