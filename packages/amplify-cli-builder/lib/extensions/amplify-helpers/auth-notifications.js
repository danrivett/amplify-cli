'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.notifySecurityEnhancement =
  exports.hasFieldAuthDirectives =
  exports.displayAuthNotification =
  exports.notifyFieldAuthSecurityChange =
    void 0;
const amplify_cli_core_1 = require('amplify-cli-core');
const amplify_prompts_1 = require('amplify-prompts');
const fs_extra_1 = __importDefault(require('fs-extra'));
const graphql_1 = require('graphql');
const graphql_transformer_core_1 = require('graphql-transformer-core');
const path_1 = __importDefault(require('path'));
async function setNotificationFlag(projectPath, flagName, value) {
  await amplify_cli_core_1.FeatureFlags.ensureFeatureFlag('graphqltransformer', flagName);
  let config = amplify_cli_core_1.stateManager.getCLIJSON(projectPath, undefined, {
    throwIfNotExist: false,
    preserveComments: true,
  });
  config.features.graphqltransformer[flagName] = value;
  amplify_cli_core_1.stateManager.setCLIJSON(projectPath, config);
  await amplify_cli_core_1.FeatureFlags.reloadValues();
}
async function notifyFieldAuthSecurityChange(context) {
  var _a;
  const flagName = 'showfieldauthnotification';
  const dontShowNotification = !amplify_cli_core_1.FeatureFlags.getBoolean(`graphqltransformer.${flagName}`);
  if (dontShowNotification) return;
  const projectPath = (_a = amplify_cli_core_1.pathManager.findProjectRoot()) !== null && _a !== void 0 ? _a : process.cwd();
  const meta = amplify_cli_core_1.stateManager.getMeta(projectPath);
  const apiNames = Object.entries((meta === null || meta === void 0 ? void 0 : meta.api) || {})
    .filter(([_, apiResource]) => apiResource.service === 'AppSync')
    .map(([name]) => name);
  const doesNotHaveGqlApi = apiNames.length < 1;
  if (doesNotHaveGqlApi) {
    return await setNotificationFlag(projectPath, flagName, false);
  }
  const apiName = apiNames[0];
  const apiResourceDir = amplify_cli_core_1.pathManager.getResourceDirectoryPath(projectPath, 'api', apiName);
  const project = await (0, graphql_transformer_core_1.readProjectConfiguration)(apiResourceDir);
  const directiveMap = (0, graphql_transformer_core_1.collectDirectivesByType)(project.schema);
  const doc = (0, graphql_1.parse)(project.schema);
  const fieldDirectives = hasFieldAuthDirectives(doc);
  if (displayAuthNotification(directiveMap, fieldDirectives)) {
    amplify_prompts_1.printer.blankLine();
    const continueChange = await amplify_prompts_1.prompter.yesOrNo(
      `This version of Amplify CLI introduces additional security enhancements for your GraphQL API. ` +
        `The changes are applied automatically with this deployment. This change won't impact your client code. Continue`,
    );
    if (!continueChange) {
      await context.usageData.emitSuccess();
      (0, amplify_cli_core_1.exitOnNextTick)(0);
    }
    modifyGraphQLSchema(apiResourceDir);
  }
  await setNotificationFlag(projectPath, flagName, false);
}
exports.notifyFieldAuthSecurityChange = notifyFieldAuthSecurityChange;
async function modifyGraphQLSchema(apiResourceDir) {
  const schemaFilePath = path_1.default.join(apiResourceDir, 'schema.graphql');
  const schemaDirectoryPath = path_1.default.join(apiResourceDir, 'schema');
  const schemaFileExists = fs_extra_1.default.existsSync(schemaFilePath);
  const schemaDirectoryExists = fs_extra_1.default.existsSync(schemaDirectoryPath);
  if (schemaFileExists) {
    fs_extra_1.default.appendFile(schemaFilePath, ' ');
  } else if (schemaDirectoryExists) {
    await modifyGraphQLSchemaDirectory(schemaDirectoryPath);
  }
}
async function modifyGraphQLSchemaDirectory(schemaDirectoryPath) {
  const files = await fs_extra_1.default.readdir(schemaDirectoryPath);
  for (const fileName of files) {
    const isHiddenFile = fileName.indexOf('.') === 0;
    if (isHiddenFile) {
      continue;
    }
    const fullPath = path_1.default.join(schemaDirectoryPath, fileName);
    const stats = await fs_extra_1.default.lstat(fullPath);
    if (stats.isDirectory() && (await modifyGraphQLSchemaDirectory(fullPath))) {
      return true;
    } else if (stats.isFile()) {
      fs_extra_1.default.appendFile(fullPath, ' ');
      return true;
    }
  }
  return false;
}
function displayAuthNotification(directiveMap, fieldDirectives) {
  const usesTransformerV2 = amplify_cli_core_1.FeatureFlags.getNumber('graphqltransformer.transformerversion') === 2;
  const schemaHasValues = Object.keys(directiveMap).some(typeName => {
    const typeObj = directiveMap[typeName];
    const modelDirective = typeObj.find(dir => dir.name.value === 'model');
    const subscriptionOff = ((modelDirective === null || modelDirective === void 0 ? void 0 : modelDirective.arguments) || []).some(arg => {
      var _a, _b;
      if (arg.name.value === 'subscriptions') {
        const subscriptionNull = arg.value.kind === 'NullValue';
        const levelFieldOffOrNull =
          (_b = (_a = arg.value) === null || _a === void 0 ? void 0 : _a.fields) === null || _b === void 0
            ? void 0
            : _b.some(({ name, value }) => {
                return name.value === 'level' && (value.value === 'off' || value.kind === 'NullValue');
              });
        return levelFieldOffOrNull || subscriptionNull;
      }
    });
    return subscriptionOff && fieldDirectives.has(typeName);
  });
  return schemaHasValues && usesTransformerV2;
}
exports.displayAuthNotification = displayAuthNotification;
function hasFieldAuthDirectives(doc) {
  var _a;
  const haveFieldAuthDir = new Set();
  (_a = doc.definitions) === null || _a === void 0
    ? void 0
    : _a.forEach(def => {
        const withAuth = (def.fields || []).filter(field => {
          var _a;
          const nonNullable = field.type.kind === 'NonNullType';
          const hasAuth = (_a = field.directives) === null || _a === void 0 ? void 0 : _a.some(dir => dir.name.value === 'auth');
          return hasAuth && nonNullable;
        });
        if (withAuth.length > 0) {
          haveFieldAuthDir.add(def.name.value);
        }
      });
  return haveFieldAuthDir;
}
exports.hasFieldAuthDirectives = hasFieldAuthDirectives;
async function notifySecurityEnhancement(context) {
  var _a;
  if (amplify_cli_core_1.FeatureFlags.getBoolean('graphqltransformer.securityEnhancementNotification')) {
    const projectPath = (_a = amplify_cli_core_1.pathManager.findProjectRoot()) !== null && _a !== void 0 ? _a : process.cwd();
    const meta = amplify_cli_core_1.stateManager.getMeta();
    const apiNames = Object.entries((meta === null || meta === void 0 ? void 0 : meta.api) || {})
      .filter(([_, apiResource]) => apiResource.service === 'AppSync')
      .map(([name]) => name);
    if (apiNames.length !== 1) {
      await setNotificationFlag(projectPath, 'securityEnhancementNotification', false);
      return;
    }
    const apiName = apiNames[0];
    const apiResourceDir = amplify_cli_core_1.pathManager.getResourceDirectoryPath(projectPath, 'api', apiName);
    const project = await (0, graphql_transformer_core_1.readProjectConfiguration)(apiResourceDir);
    const directiveMap = (0, graphql_transformer_core_1.collectDirectivesByTypeNames)(project.schema);
    const notifyAuthWithKey = Object.keys(directiveMap.types).some(
      type => directiveMap.types[type].includes('auth') && directiveMap.types[type].includes('primaryKey'),
    );
    if ((meta === null || meta === void 0 ? void 0 : meta.auth) && notifyAuthWithKey) {
      amplify_prompts_1.printer.blankLine();
      const shouldContinue = await amplify_prompts_1.prompter.yesOrNo(
        `This version of Amplify CLI introduces additional security enhancements for your GraphQL API. @auth authorization rules applied on primary keys and indexes are scoped down further. The changes are applied automatically with this deployment. This change won't impact your client code. Continue`,
      );
      if (!shouldContinue) {
        await context.usageData.emitSuccess();
        (0, amplify_cli_core_1.exitOnNextTick)(0);
      }
      await modifyGraphQLSchema(apiResourceDir);
      await setNotificationFlag(projectPath, 'securityEnhancementNotification', false);
    } else {
      await setNotificationFlag(projectPath, 'securityEnhancementNotification', false);
    }
  }
}
exports.notifySecurityEnhancement = notifySecurityEnhancement;
//# sourceMappingURL=auth-notifications.js.map
