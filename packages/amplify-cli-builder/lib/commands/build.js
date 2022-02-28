'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getResources = exports.run = void 0;
const amplify_prompts_1 = require('amplify-prompts');
const amplify_category_custom_1 = require('@aws-amplify/amplify-category-custom');
const subcommand = 'build';
const run = async context => {
  var _a, _b, _c, _d;
  const categoryName =
    (_b = (_a = context === null || context === void 0 ? void 0 : context.input) === null || _a === void 0 ? void 0 : _a.subCommands) ===
      null || _b === void 0
      ? void 0
      : _b[0];
  let resourceName =
    (_d = (_c = context === null || context === void 0 ? void 0 : context.input) === null || _c === void 0 ? void 0 : _c.subCommands) ===
      null || _d === void 0
      ? void 0
      : _d[1];
  if (categoryName === undefined) {
    resourceName = undefined;
  }
  try {
    await (0, amplify_category_custom_1.generateDependentResourcesType)(context);
    const resourcesToBuild = await (0, exports.getResources)(context);
    let filteredResources = resourcesToBuild;
    if (categoryName) {
      filteredResources = filteredResources.filter(resource => resource.category === categoryName);
    }
    if (categoryName && resourceName) {
      filteredResources = filteredResources.filter(
        resource => resource.category === categoryName && resource.resourceName === resourceName,
      );
    }
    if (!categoryName && !resourceName) {
      await context.amplify.invokePluginMethod(context, 'awscloudformation', undefined, 'transformResourceWithOverrides', [context]);
    }
    for (const resource of filteredResources) {
      await context.amplify.invokePluginMethod(context, 'awscloudformation', undefined, 'transformResourceWithOverrides', [
        context,
        resource,
      ]);
    }
  } catch (err) {
    amplify_prompts_1.printer.error(err.stack);
    amplify_prompts_1.printer.error('There was an error building the resource');
    context.usageData.emitError(err);
    process.exitCode = 1;
  }
};
exports.run = run;
const getResources = async context => {
  const resources = [];
  const { resourcesToBeCreated, resourcesToBeUpdated } = await context.amplify.getResourceStatus();
  resourcesToBeCreated.forEach(resourceCreated => {
    resources.push({
      service: resourceCreated.service,
      category: resourceCreated.category,
      resourceName: resourceCreated.resourceName,
    });
  });
  resourcesToBeUpdated.forEach(resourceUpdated => {
    resources.push({
      service: resourceUpdated.service,
      category: resourceUpdated.category,
      resourceName: resourceUpdated.resourceName,
    });
  });
  return resources;
};
exports.getResources = getResources;
//# sourceMappingURL=build.js.map
