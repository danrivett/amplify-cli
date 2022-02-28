'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.displayBannerMessages = void 0;
const amplify_cli_core_1 = require('amplify-cli-core');
const ci_info_1 = require('ci-info');
const amplify_prompts_1 = require('amplify-prompts');
async function displayBannerMessages(input) {
  const excludedCommands = ['delete', 'env', 'help', 'logout', 'version'];
  if (ci_info_1.isCI || (input.command && excludedCommands.includes(input.command))) {
    return;
  }
  await displayLayerMigrationMessage();
  if ((0, amplify_cli_core_1.skipHooks)()) {
    amplify_prompts_1.printer.warn('Amplify command hooks are disabled in the current execution environment.');
    amplify_prompts_1.printer.warn('See https://docs.amplify.aws/cli/usage/command-hooks/ for more information.');
  }
}
exports.displayBannerMessages = displayBannerMessages;
async function displayLayerMigrationMessage() {
  const layerMigrationBannerMessage = await amplify_cli_core_1.BannerMessage.getMessage('LAMBDA_LAYER_MIGRATION_WARNING');
  const rootPath = amplify_cli_core_1.pathManager.findProjectRoot();
  if (rootPath === undefined) {
    return;
  }
  const meta = amplify_cli_core_1.stateManager.getMeta(rootPath, { throwIfNotExist: false });
  const hasDeprecatedLayerResources =
    Object.values((meta === null || meta === void 0 ? void 0 : meta.function) || {}).filter(
      resource =>
        (resource === null || resource === void 0 ? void 0 : resource.service) === 'LambdaLayer' &&
        (resource === null || resource === void 0 ? void 0 : resource.layerVersionMap) !== undefined,
    ).length > 0;
  if (hasDeprecatedLayerResources && layerMigrationBannerMessage) {
    amplify_prompts_1.printer.blankLine();
    amplify_prompts_1.printer.warn(layerMigrationBannerMessage);
    amplify_prompts_1.printer.blankLine();
  }
}
//# sourceMappingURL=display-banner-messages.js.map
