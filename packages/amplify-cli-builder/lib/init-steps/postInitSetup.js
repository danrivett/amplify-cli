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
exports.postInitSetup = void 0;
const amplify_cli_core_1 = require('amplify-cli-core');
const child_process_1 = require('child_process');
const lodash_1 = __importDefault(require('lodash'));
const path = __importStar(require('path'));
const packageJson = 'package.json';
const initializationScripts = ['start', 'serve'];
const MISSING_SCRIPTS_ERROR = new Error(
  'Did not find a "start" or "serve" initialization script. Add a package.json file in the root of the project with one of these scripts.',
);
async function postInitSetup(context) {
  if (context.parameters.options.app) {
    try {
      context.parameters.options.app = true;
      context.parameters.options.y = true;
      context.amplify.constructExeInfo(context);
      await context.amplify.pushResources(context);
      await runPackage();
    } catch (e) {
      if (e.name !== 'InvalidDirectiveError') {
        context.print.error(`An error occurred during the push operation: ${e.message}`);
      }
      await context.usageData.emitError(e);
      (0, amplify_cli_core_1.exitOnNextTick)(1);
    }
  }
}
exports.postInitSetup = postInitSetup;
async function runPackage() {
  const packageManager = (0, amplify_cli_core_1.getPackageManager)();
  if (packageManager !== null) {
    const packageScript = getPackageScript();
    (0, child_process_1.execSync)(`${packageManager.executable} ${packageScript}`, { stdio: 'inherit' });
  }
}
function getPackageScript() {
  const packageJsonDir = path.join(process.cwd(), packageJson);
  const packageJsonContent = amplify_cli_core_1.JSONUtilities.readJson(packageJsonDir, { throwIfNotExist: false }) || {};
  const scripts = lodash_1.default.get(packageJsonContent, 'scripts', {});
  return (
    lodash_1.default.keys(scripts).find(scriptName => initializationScripts.includes(scriptName)) ||
    (() => {
      throw MISSING_SCRIPTS_ERROR;
    })()
  );
}
//# sourceMappingURL=postInitSetup.js.map
