'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.showTroubleshootingURL = exports.run = void 0;
const amplify_prompts_1 = require('amplify-prompts');
const show_all_help_1 = require('../extensions/amplify-helpers/show-all-help');
const amplify_cli_core_1 = require('amplify-cli-core');
const run = async context => {
  await (0, show_all_help_1.showAllHelp)(context);
};
exports.run = run;
const showTroubleshootingURL = () => {
  amplify_prompts_1.printer.warn(
    `Please refer ${amplify_cli_core_1.AMPLIFY_SUPPORT_DOCS.CLI_PROJECT_TROUBLESHOOTING.name} at : ${amplify_cli_core_1.AMPLIFY_SUPPORT_DOCS.CLI_PROJECT_TROUBLESHOOTING.url}`,
  );
};
exports.showTroubleshootingURL = showTroubleshootingURL;
//# sourceMappingURL=help.js.map
