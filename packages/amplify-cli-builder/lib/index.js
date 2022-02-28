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
exports.executeAmplifyCommand = exports.execute = exports.run = void 0;
const amplify_cli_core_1 = require('amplify-cli-core');
const ci_info_1 = require('ci-info');
const events_1 = require('events');
const fs = __importStar(require('fs-extra'));
const path = __importStar(require('path'));
const conditional_local_logging_init_1 = require('./conditional-local-logging-init');
const context_extensions_1 = require('./context-extensions');
const context_manager_1 = require('./context-manager');
const display_banner_messages_1 = require('./display-banner-messages');
const constants_1 = require('./domain/constants');
const execution_manager_1 = require('./execution-manager');
const input_manager_1 = require('./input-manager');
const plugin_manager_1 = require('./plugin-manager');
const project_config_version_check_1 = require('./project-config-version-check');
const rewireDeprecatedCommands_1 = require('./rewireDeprecatedCommands');
const mobilehub_support_1 = require('./utils/mobilehub-support');
const team_provider_migrate_1 = require('./utils/team-provider-migrate');
const win_utils_1 = require('./utils/win-utils');
const version_notifier_1 = require('./version-notifier');
const get_amplify_version_1 = require('./extensions/amplify-helpers/get-amplify-version');
events_1.EventEmitter.defaultMaxListeners = 1000;
Error.stackTraceLimit = Number.MAX_SAFE_INTEGER;
let errorHandler = e => {};
process.on('uncaughtException', function (error) {
  if (errorHandler) {
    errorHandler(error);
  } else {
    if (error.message) {
      console.error(error.message);
    }
    if (error.stack) {
      console.log(error.stack);
    }
    (0, amplify_cli_core_1.exitOnNextTick)(1);
  }
});
process.on('unhandledRejection', function (error) {
  throw error;
});
function convertKeysToLowerCase(obj) {
  let newObj = {};
  for (let key of Object.keys(obj)) {
    newObj[key.toLowerCase()] = obj[key];
  }
  return newObj;
}
function normalizeStatusCommandOptions(input) {
  let options = input.options ? input.options : {};
  const allowedVerboseIndicators = [constants_1.constants.VERBOSE, 'v'];
  for (let verboseFlag of allowedVerboseIndicators) {
    if (options.hasOwnProperty(verboseFlag)) {
      if (typeof options[verboseFlag] === 'string') {
        const pluginName = options[verboseFlag].toLowerCase();
        options[pluginName] = true;
      }
      delete options[verboseFlag];
      options['verbose'] = true;
    }
  }
  if (input.plugin) {
    options[input.plugin] = true;
    delete input.plugin;
  }
  if (input.subCommands) {
    const allowedSubCommands = [constants_1.constants.HELP, constants_1.constants.VERBOSE];
    let inputSubCommands = [];
    input.subCommands.map(subCommand => {
      if (!allowedSubCommands.includes(subCommand)) {
        options[subCommand.toLowerCase()] = true;
      } else {
        inputSubCommands.push(subCommand);
      }
    });
    input.subCommands = inputSubCommands;
  }
  input.options = convertKeysToLowerCase(options);
  return input;
}
async function run() {
  var _a, _b, _c, _d, _e;
  try {
    (0, win_utils_1.deleteOldVersion)();
    let pluginPlatform = await (0, plugin_manager_1.getPluginPlatform)();
    let input = (0, input_manager_1.getCommandLineInput)(pluginPlatform);
    if (input.command !== 'help') {
      (0, version_notifier_1.notify)({ defer: false, isGlobal: true });
    }
    if (input.command == 'status') {
      input = normalizeStatusCommandOptions(input);
    }
    const pkg = amplify_cli_core_1.JSONUtilities.readJson(path.join(__dirname, '..', 'package.json'));
    amplify_cli_core_1.BannerMessage.initialize(pkg.version);
    ensureFilePermissions(amplify_cli_core_1.pathManager.getAWSCredentialsFilePath());
    ensureFilePermissions(amplify_cli_core_1.pathManager.getAWSConfigFilePath());
    let verificationResult = (0, input_manager_1.verifyInput)(pluginPlatform, input);
    if (!verificationResult.verified) {
      if (verificationResult.message) {
        context_extensions_1.print.warning(verificationResult.message);
      }
      pluginPlatform = await (0, plugin_manager_1.scan)();
      input = (0, input_manager_1.getCommandLineInput)(pluginPlatform);
      verificationResult = (0, input_manager_1.verifyInput)(pluginPlatform, input);
    }
    if (!verificationResult.verified) {
      if (verificationResult.helpCommandAvailable) {
        input.command = constants_1.constants.HELP;
      } else {
        throw new Error(verificationResult.message);
      }
    }
    (0, rewireDeprecatedCommands_1.rewireDeprecatedCommands)(input);
    (0, conditional_local_logging_init_1.logInput)(input);
    const hooksMeta = amplify_cli_core_1.HooksMeta.getInstance(input);
    hooksMeta.setAmplifyVersion((0, get_amplify_version_1.getAmplifyVersion)());
    const context = (0, context_manager_1.constructContext)(pluginPlatform, input);
    const contextEnvironmentProvider = new amplify_cli_core_1.CLIContextEnvironmentProvider({
      getEnvInfo: context.amplify.getEnvInfo,
    });
    const projectPath = (_a = amplify_cli_core_1.pathManager.findProjectRoot()) !== null && _a !== void 0 ? _a : process.cwd();
    const useNewDefaults = !amplify_cli_core_1.stateManager.projectConfigExists(projectPath);
    await amplify_cli_core_1.FeatureFlags.initialize(contextEnvironmentProvider, useNewDefaults);
    await (0, context_manager_1.attachUsageData)(context);
    if (!(await (0, team_provider_migrate_1.migrateTeamProviderInfo)(context))) {
      context.usageData.emitError(new amplify_cli_core_1.TeamProviderInfoMigrateError());
      return 1;
    }
    errorHandler = boundErrorHandler.bind(context);
    process.on('SIGINT', sigIntHandler.bind(context));
    if (!ci_info_1.isCI && context.input.command === 'push') {
      await (0, project_config_version_check_1.checkProjectConfigVersion)(context);
    }
    context.usageData.emitInvoke();
    if (!(0, mobilehub_support_1.ensureMobileHubCommandCompatibility)(context)) {
      return 1;
    }
    await (0, display_banner_messages_1.displayBannerMessages)(input);
    await (0, execution_manager_1.executeCommand)(context);
    const exitCode = process.exitCode || 0;
    if (exitCode === 0) {
      context.usageData.emitSuccess();
    }
    if (input.command === 'help') {
      (0, version_notifier_1.notify)({ defer: true, isGlobal: true });
    }
    return exitCode;
  } catch (error) {
    errorHandler(error);
    if (error.name === 'JSONValidationError') {
      const jsonError = error;
      let printSummary = false;
      context_extensions_1.print.error(error.message);
      if (((_b = jsonError.unknownFlags) === null || _b === void 0 ? void 0 : _b.length) > 0) {
        context_extensions_1.print.error('');
        context_extensions_1.print.error(
          `These feature flags are defined in the "amplify/cli.json" configuration file and are unknown to the currently running Amplify CLI:`,
        );
        for (const unknownFlag of jsonError.unknownFlags) {
          context_extensions_1.print.error(`  - ${unknownFlag}`);
        }
        printSummary = true;
      }
      if (((_c = jsonError.otherErrors) === null || _c === void 0 ? void 0 : _c.length) > 0) {
        context_extensions_1.print.error('');
        context_extensions_1.print.error(`The following feature flags have validation errors:`);
        for (const otherError of jsonError.otherErrors) {
          context_extensions_1.print.error(`  - ${otherError}`);
        }
        printSummary = true;
      }
      if (printSummary) {
        context_extensions_1.print.error('');
        context_extensions_1.print.error(
          `This issue likely happens when the project has been pushed with a newer version of Amplify CLI, try updating to a newer version.`,
        );
        if (ci_info_1.isCI) {
          context_extensions_1.print.error('');
          context_extensions_1.print.error(`Ensure that the CI/CD pipeline is not using an older or pinned down version of Amplify CLI.`);
        }
        context_extensions_1.print.error('');
        context_extensions_1.print.error(`Learn more about feature flags: https://docs.amplify.aws/cli/reference/feature-flags`);
      }
    } else {
      if (error.message) {
        context_extensions_1.print.error(error.message);
      }
      if (error.stack) {
        context_extensions_1.print.info(error.stack);
      }
    }
    await (0, amplify_cli_core_1.executeHooks)(
      amplify_cli_core_1.HooksMeta.getInstance(undefined, 'post', {
        message: (_d = error.message) !== null && _d !== void 0 ? _d : 'undefined error in Amplify process',
        stack: (_e = error.stack) !== null && _e !== void 0 ? _e : 'undefined error stack',
      }),
    );
    (0, amplify_cli_core_1.exitOnNextTick)(1);
  }
}
exports.run = run;
function ensureFilePermissions(filePath) {
  if (fs.existsSync(filePath) && (fs.statSync(filePath).mode & 0o777) === 0o644) {
    fs.chmodSync(filePath, '600');
  }
}
function boundErrorHandler(e) {
  this.usageData.emitError(e);
}
async function sigIntHandler(e) {
  this.usageData.emitAbort();
  try {
    await this.amplify.runCleanUpTasks(this);
  } catch (err) {
    this.print.warning(`Could not run clean up tasks\nError: ${err.message}`);
  }
  this.print.warning('^Aborted!');
  (0, amplify_cli_core_1.exitOnNextTick)(2);
}
async function execute(input) {
  let errorHandler = e => {};
  try {
    let pluginPlatform = await (0, plugin_manager_1.getPluginPlatform)();
    let verificationResult = (0, input_manager_1.verifyInput)(pluginPlatform, input);
    if (!verificationResult.verified) {
      if (verificationResult.message) {
        context_extensions_1.print.warning(verificationResult.message);
      }
      pluginPlatform = await (0, plugin_manager_1.scan)();
      verificationResult = (0, input_manager_1.verifyInput)(pluginPlatform, input);
    }
    if (!verificationResult.verified) {
      if (verificationResult.helpCommandAvailable) {
        input.command = constants_1.constants.HELP;
      } else {
        throw new Error(verificationResult.message);
      }
    }
    const context = (0, context_manager_1.constructContext)(pluginPlatform, input);
    await (0, context_manager_1.attachUsageData)(context);
    errorHandler = boundErrorHandler.bind(context);
    process.on('SIGINT', sigIntHandler.bind(context));
    context.usageData.emitInvoke();
    await (0, execution_manager_1.executeCommand)(context);
    const exitCode = process.exitCode || 0;
    if (exitCode === 0) {
      context.usageData.emitSuccess();
    }
    return exitCode;
  } catch (e) {
    errorHandler(e);
    if (e.message) {
      context_extensions_1.print.error(e.message);
    }
    if (e.stack) {
      context_extensions_1.print.info(e.stack);
    }
    return 1;
  }
}
exports.execute = execute;
async function executeAmplifyCommand(context) {
  if (context.input.command) {
    const commandPath = path.normalize(path.join(__dirname, 'commands', context.input.command));
    const commandModule = await Promise.resolve().then(() => __importStar(require(commandPath)));
    await commandModule.run(context);
  }
}
exports.executeAmplifyCommand = executeAmplifyCommand;
//# sourceMappingURL=index.js.map
