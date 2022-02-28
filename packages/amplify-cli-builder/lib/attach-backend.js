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
exports.attachBackend = void 0;
const fs = __importStar(require('fs-extra'));
const path = __importStar(require('path'));
const amplify_cli_core_1 = require('amplify-cli-core');
const a10_queryProvider_1 = require('./attach-backend-steps/a10-queryProvider');
const a20_analyzeProject_1 = require('./attach-backend-steps/a20-analyzeProject');
const a30_initFrontend_1 = require('./attach-backend-steps/a30-initFrontend');
const a40_generateFiles_1 = require('./attach-backend-steps/a40-generateFiles');
const amplify_service_helper_1 = require('./amplify-service-helper');
const initialize_env_1 = require('./initialize-env');
const backupAmplifyDirName = 'amplify-backup';
async function attachBackend(context, inputParams) {
  prepareContext(context, inputParams);
  backupAmplifyFolder();
  setupFolderStructure();
  try {
    await (0, a10_queryProvider_1.queryProvider)(context);
    if (amplify_cli_core_1.FeatureFlags.isInitialized()) {
      await amplify_cli_core_1.FeatureFlags.reloadValues();
    }
    await (0, a20_analyzeProject_1.analyzeProject)(context);
    await (0, a30_initFrontend_1.initFrontend)(context);
    await (0, a40_generateFiles_1.generateFiles)(context);
    await onSuccess(context);
  } catch (e) {
    removeAmplifyFolderStructure();
    restoreOriginalAmplifyFolder();
    context.print.error('Failed to pull the backend.');
    context.usageData.emitError(e);
    throw e;
  }
}
exports.attachBackend = attachBackend;
async function onSuccess(context) {
  var _a;
  const { inputParams } = context.exeInfo;
  if (inputParams.amplify.noOverride) {
    const projectPath = process.cwd();
    const backupAmplifyDirPath = path.join(projectPath, backupAmplifyDirName);
    const backupBackendDirPath = path.join(backupAmplifyDirPath, context.amplify.constants.BackendamplifyCLISubDirName);
    if (fs.existsSync(backupBackendDirPath)) {
      const backendDirPath = amplify_cli_core_1.pathManager.getBackendDirPath(projectPath);
      fs.removeSync(backendDirPath);
      fs.copySync(backupBackendDirPath, backendDirPath);
    }
  }
  await (0, amplify_service_helper_1.postPullCodegen)(context);
  if (!inputParams.yes) {
    const shouldKeepAmplifyDir = ((_a = context.exeInfo.existingLocalEnvInfo) === null || _a === void 0 ? void 0 : _a.noUpdateBackend)
      ? !context.exeInfo.existingLocalEnvInfo.noUpdateBackend
      : await context.amplify.confirmPrompt('Do you plan on modifying this backend?', true);
    if (shouldKeepAmplifyDir) {
      if (amplify_cli_core_1.stateManager.currentMetaFileExists()) {
        await (0, initialize_env_1.initializeEnv)(context, amplify_cli_core_1.stateManager.getCurrentMeta());
      }
      const { envName } = context.exeInfo.localEnvInfo;
      context.print.info('');
      context.print.success(`Successfully pulled backend environment ${envName} from the cloud.`);
      context.print.info(`Run 'amplify pull' to sync future upstream changes.`);
      context.print.info('');
    } else {
      amplify_cli_core_1.stateManager.setLocalEnvInfo(process.cwd(), { ...context.exeInfo.localEnvInfo, noUpdateBackend: true });
      removeAmplifyFolderStructure(true);
      context.print.info('');
      context.print.success(`Added backend environment config object to your project.`);
      context.print.info(`Run 'amplify pull' to sync future upstream changes.`);
      context.print.info('');
    }
  } else {
    if (amplify_cli_core_1.stateManager.currentMetaFileExists()) {
      await (0, initialize_env_1.initializeEnv)(context, amplify_cli_core_1.stateManager.getCurrentMeta());
    }
  }
  removeBackupAmplifyFolder();
}
function backupAmplifyFolder() {
  const projectPath = process.cwd();
  const amplifyDirPath = amplify_cli_core_1.pathManager.getAmplifyDirPath(projectPath);
  if (fs.existsSync(amplifyDirPath)) {
    const backupAmplifyDirPath = path.join(projectPath, backupAmplifyDirName);
    if (fs.existsSync(backupAmplifyDirPath)) {
      const error = new Error(`Backup folder at ${backupAmplifyDirPath} already exists, remove the folder and retry the operation.`);
      error.name = 'BackupFolderAlreadyExist';
      error.stack = undefined;
      throw error;
    }
    try {
      fs.moveSync(amplifyDirPath, backupAmplifyDirPath);
    } catch (e) {
      if (e.code === 'EPERM') {
        throw new Error(
          'Could not attach the backend to the project. Ensure that there are no applications locking the `amplify` folder and try again',
        );
      }
      throw e;
    }
  }
}
function restoreOriginalAmplifyFolder() {
  const projectPath = process.cwd();
  const backupAmplifyDirPath = path.join(projectPath, backupAmplifyDirName);
  if (fs.existsSync(backupAmplifyDirPath)) {
    const amplifyDirPath = amplify_cli_core_1.pathManager.getAmplifyDirPath(projectPath);
    fs.removeSync(amplifyDirPath);
    fs.moveSync(backupAmplifyDirPath, amplifyDirPath);
  }
}
function removeBackupAmplifyFolder() {
  const projectPath = process.cwd();
  const backupAmplifyDirPath = path.join(projectPath, backupAmplifyDirName);
  fs.removeSync(backupAmplifyDirPath);
}
function setupFolderStructure() {
  const projectPath = process.cwd();
  const amplifyDirPath = amplify_cli_core_1.pathManager.getAmplifyDirPath(projectPath);
  const dotConfigDirPath = amplify_cli_core_1.pathManager.getDotConfigDirPath(projectPath);
  const currentCloudBackendDirPath = amplify_cli_core_1.pathManager.getCurrentCloudBackendDirPath(projectPath);
  const backendDirPath = amplify_cli_core_1.pathManager.getBackendDirPath(projectPath);
  fs.ensureDirSync(amplifyDirPath);
  fs.ensureDirSync(dotConfigDirPath);
  fs.ensureDirSync(currentCloudBackendDirPath);
  fs.ensureDirSync(backendDirPath);
}
function removeAmplifyFolderStructure(partial = false) {
  const projectPath = process.cwd();
  if (partial) {
    fs.removeSync(amplify_cli_core_1.pathManager.getBackendDirPath(projectPath));
    fs.removeSync(amplify_cli_core_1.pathManager.getCurrentCloudBackendDirPath(projectPath));
  } else {
    const amplifyDirPath = amplify_cli_core_1.pathManager.getAmplifyDirPath(projectPath);
    fs.removeSync(amplifyDirPath);
  }
}
function prepareContext(context, inputParams) {
  const projectPath = process.cwd();
  context.exeInfo = {
    isNewProject: true,
    inputParams,
    projectConfig: {},
    localEnvInfo: {
      projectPath,
    },
    teamProviderInfo: {},
    existingProjectConfig: amplify_cli_core_1.stateManager.getProjectConfig(projectPath, {
      throwIfNotExist: false,
    }),
    existingTeamProviderInfo: amplify_cli_core_1.stateManager.getTeamProviderInfo(projectPath, {
      throwIfNotExist: false,
    }),
    existingLocalEnvInfo: amplify_cli_core_1.stateManager.getLocalEnvInfo(projectPath, {
      throwIfNotExist: false,
    }),
    existingLocalAwsInfo: amplify_cli_core_1.stateManager.getLocalAWSInfo(projectPath, {
      throwIfNotExist: false,
    }),
  };
  updateContextForNoUpdateBackendProjects(context);
}
function updateContextForNoUpdateBackendProjects(context) {
  var _a, _b;
  if ((_a = context.exeInfo.existingLocalEnvInfo) === null || _a === void 0 ? void 0 : _a.noUpdateBackend) {
    const envName = context.exeInfo.existingLocalEnvInfo.envName;
    context.exeInfo.isNewProject = false;
    context.exeInfo.localEnvInfo = context.exeInfo.existingLocalEnvInfo;
    context.exeInfo.projectConfig = context.exeInfo.existingProjectConfig;
    context.exeInfo.awsConfigInfo = context.exeInfo.existingLocalAwsInfo[envName];
    context.exeInfo.awsConfigInfo.config = { ...context.exeInfo.existingLocalAwsInfo[envName] };
    context.exeInfo.teamProviderInfo = context.exeInfo.existingTeamProviderInfo;
    context.exeInfo.inputParams = context.exeInfo.inputParams || {};
    context.exeInfo.inputParams.amplify = context.exeInfo.inputParams.amplify || {};
    context.exeInfo.inputParams.amplify.defaultEditor =
      context.exeInfo.inputParams.amplify.defaultEditor || context.exeInfo.existingLocalEnvInfo.defaultEditor;
    context.exeInfo.inputParams.amplify.projectName =
      context.exeInfo.inputParams.amplify.projectName || context.exeInfo.existingProjectConfig.projectName;
    context.exeInfo.inputParams.amplify.envName = context.exeInfo.inputParams.amplify.envName || envName;
    context.exeInfo.inputParams.amplify.frontend =
      context.exeInfo.inputParams.amplify.frontend || context.exeInfo.existingProjectConfig.frontend;
    context.exeInfo.inputParams.amplify.appId =
      context.exeInfo.inputParams.amplify.appId ||
      ((_b = context.exeInfo.existingTeamProviderInfo[envName].awscloudformation) === null || _b === void 0 ? void 0 : _b.AmplifyAppId);
    context.exeInfo.inputParams[context.exeInfo.inputParams.amplify.frontend] =
      context.exeInfo.inputParams[context.exeInfo.inputParams.amplify.frontend] ||
      context.exeInfo.existingProjectConfig[context.exeInfo.inputParams.amplify.frontend];
  }
}
//# sourceMappingURL=attach-backend.js.map
