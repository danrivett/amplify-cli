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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.preDeployPullBackend = void 0;
const amplify_app_1 = require('amplify-app');
const amplify_cli_core_1 = require('amplify-cli-core');
const amplify_prompts_1 = require('amplify-prompts');
const fs = __importStar(require('fs-extra'));
const node_fetch_1 = __importDefault(require('node-fetch'));
const path = __importStar(require('path'));
async function preDeployPullBackend(context, sandboxId) {
  var _a;
  const providerPlugin = await Promise.resolve().then(() =>
    __importStar(require(context.amplify.getProviderPlugins(context).awscloudformation)),
  );
  const appStateBaseUrl =
    (_a = process.env.AMPLIFY_CLI_APPSTATE_BASE_URL) !== null && _a !== void 0
      ? _a
      : providerPlugin.adminBackendMap['us-east-1'].appStateUrl;
  const url = `${appStateBaseUrl}/AppState/${sandboxId}`;
  const res = await (0, node_fetch_1.default)(`${url}`);
  const resJson = await res.json();
  const appNotFoundMessage = 'Requested app was not found';
  if (resJson.message === appNotFoundMessage) {
    amplify_prompts_1.printer.error(appNotFoundMessage);
    await context.usageData.emitError(new amplify_cli_core_1.AppNotFoundError(appNotFoundMessage));
    process.exitCode = 1;
    return;
  }
  if (resJson.appId) {
    const deployedErrorMessage = `This app is already deployed. You can pull it using "amplify pull --appId ${resJson.appId}"`;
    amplify_prompts_1.printer.error(deployedErrorMessage);
    await context.usageData.emitError(new amplify_cli_core_1.AppAlreadyDeployedError(deployedErrorMessage));
    process.exitCode = 1;
    return;
  }
  if (!resJson.schema) {
    const missingSchemaMessage = 'No GraphQL schema found in the app.';
    amplify_prompts_1.printer.error(missingSchemaMessage);
    await context.usageData.emitError(new amplify_cli_core_1.SchemaDoesNotExistError(missingSchemaMessage));
    process.exitCode = 1;
    return;
  }
  const amplifyDirPath = amplify_cli_core_1.pathManager.getBackendDirPath(process.cwd());
  if (!fs.existsSync(amplifyDirPath)) {
    await (0, amplify_app_1.run)({ skipEnvCheck: true });
  }
  replaceSchema(resJson.schema);
  await context.amplify.invokePluginMethod(context, 'codegen', undefined, 'generateModels', [context]);
}
exports.preDeployPullBackend = preDeployPullBackend;
function replaceSchema(schema) {
  const schemaFilePath = path.join(process.cwd(), 'amplify', 'backend', 'api', 'amplifyDatasource', 'schema.graphql');
  fs.writeFileSync(schemaFilePath, schema);
}
//# sourceMappingURL=pre-deployment-pull.js.map
