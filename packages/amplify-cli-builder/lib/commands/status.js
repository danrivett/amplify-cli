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
exports.run = void 0;
const path = __importStar(require('path'));
const fs = __importStar(require('fs-extra'));
const amplify_cli_core_1 = require('amplify-cli-core');
const amplify_prompts_1 = require('amplify-prompts');
const run = async context => {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const cliParams = {
    cliCommand: (_a = context === null || context === void 0 ? void 0 : context.input) === null || _a === void 0 ? void 0 : _a.command,
    cliSubcommands:
      (_b = context === null || context === void 0 ? void 0 : context.input) === null || _b === void 0 ? void 0 : _b.subCommands,
    cliOptions: (_c = context === null || context === void 0 ? void 0 : context.input) === null || _c === void 0 ? void 0 : _c.options,
  };
  const view = new amplify_cli_core_1.ViewResourceTableParams(cliParams);
  if (
    (_e = (_d = context === null || context === void 0 ? void 0 : context.input) === null || _d === void 0 ? void 0 : _d.subCommands) ===
      null || _e === void 0
      ? void 0
      : _e.includes('help')
  ) {
    context.print.info(view.getStyledHelp());
  } else if (
    ((_f = cliParams.cliOptions) === null || _f === void 0 ? void 0 : _f.api) &&
    ((_g = cliParams.cliOptions) === null || _g === void 0 ? void 0 : _g.acm)
  ) {
    try {
      if (typeof ((_h = cliParams.cliOptions) === null || _h === void 0 ? void 0 : _h.acm) !== 'string') {
        amplify_prompts_1.printer.error('You must pass in a model name for the acm option.');
        return;
      }
      await showApiAuthAcm(context);
    } catch (err) {
      amplify_prompts_1.printer.error(err === null || err === void 0 ? void 0 : err.message);
    }
  } else {
    try {
      await context.amplify.showStatusTable(view);
      await context.amplify.showHelpfulProviderLinks(context);
      await showAmplifyConsoleHostingStatus(context);
    } catch (e) {
      view.logErrorException(e, context);
    }
  }
};
exports.run = run;
async function showAmplifyConsoleHostingStatus(context) {
  const pluginInfo = context.amplify.getCategoryPluginInfo(context, 'hosting', 'amplifyhosting');
  if (pluginInfo && pluginInfo.packageLocation) {
    const { status } = await Promise.resolve().then(() => __importStar(require(pluginInfo.packageLocation)));
    if (status) {
      await status(context);
    }
  }
}
async function showApiAuthAcm(context) {
  var _a, _b, _c, _d, _e, _f;
  const providerPlugin = await Promise.resolve().then(() =>
    __importStar(require((_a = context.amplify.getProviderPlugins(context)) === null || _a === void 0 ? void 0 : _a.awscloudformation)),
  );
  const transformerVersion = await providerPlugin.getTransformerVersion(context);
  if (transformerVersion < 2) {
    amplify_prompts_1.printer.error('This command requires version two or greater of the GraphQL transformer.');
    return;
  }
  const apiNames = Object.entries(((_b = amplify_cli_core_1.stateManager.getMeta()) === null || _b === void 0 ? void 0 : _b.api) || {})
    .filter(([_, apiResource]) => apiResource.service === 'AppSync')
    .map(([name]) => name);
  if (apiNames.length === 0) {
    amplify_prompts_1.printer.info(
      'No GraphQL API configured in the project. Only GraphQL APIs can be migrated. To add a GraphQL API run `amplify add api`.',
    );
    return;
  }
  if (apiNames.length > 1) {
    amplify_prompts_1.printer.error(
      'You have multiple GraphQL APIs in the project. Only one GraphQL API is allowed per project. Run `amplify remove api` to remove an API.',
    );
    return;
  }
  try {
    await providerPlugin.compileSchema(context, {
      forceCompile: true,
    });
  } catch (error) {
    amplify_prompts_1.printer.warn('ACM generation requires a valid schema, the provided schema is invalid.');
    if (error.name) {
      amplify_prompts_1.printer.error(`${error.name}: ${(_c = error.message) === null || _c === void 0 ? void 0 : _c.trim()}`);
    } else {
      amplify_prompts_1.printer.error(
        `An error has occured during schema compilation: ${(_d = error.message) === null || _d === void 0 ? void 0 : _d.trim()}`,
      );
    }
    return;
  }
  const apiName = apiNames[0];
  const apiResourceDir = path.join(amplify_cli_core_1.pathManager.getBackendDirPath(), 'api', apiName);
  const schemaPath = path.join(apiResourceDir, 'schema.graphql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const cliOptions =
    (_f = (_e = context === null || context === void 0 ? void 0 : context.input) === null || _e === void 0 ? void 0 : _e.options) !==
      null && _f !== void 0
      ? _f
      : {};
  const { showACM } = await Promise.resolve().then(() => __importStar(require('../extensions/amplify-helpers/show-auth-acm')));
  showACM(schema, cliOptions.acm);
}
//# sourceMappingURL=status.js.map
