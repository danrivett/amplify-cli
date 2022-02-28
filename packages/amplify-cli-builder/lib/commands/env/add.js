'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.run = void 0;
const amplify_cli_core_1 = require('amplify-cli-core');
const init_1 = require('../init');
const fs_extra_1 = __importDefault(require('fs-extra'));
const run = async context => {
  const amplifyMetaFilePath = amplify_cli_core_1.pathManager.getAmplifyMetaFilePath();
  if (!fs_extra_1.default.existsSync(amplifyMetaFilePath)) {
    throw new Error(
      'Your workspace is not configured to modify the backend. If you wish to change this configuration, remove your `amplify` directory and pull the project again.',
    );
  }
  await (0, init_1.run)(context);
};
exports.run = run;
//# sourceMappingURL=add.js.map
