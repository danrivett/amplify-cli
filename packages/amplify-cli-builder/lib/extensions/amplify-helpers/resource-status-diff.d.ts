import chalk from 'chalk';
import * as cfnDiff from '@aws-cdk/cloudformation-diff';
import { Template } from 'cloudform-types';
export interface StackMutationInfo {
  label: String;
  consoleStyle: chalk.Chalk;
  icon: String;
}
export interface StackMutationType {
  CREATE: StackMutationInfo;
  UPDATE: StackMutationInfo;
  DELETE: StackMutationInfo;
  IMPORT: StackMutationInfo;
  UNLINK: StackMutationInfo;
  NOCHANGE: StackMutationInfo;
}
export declare const stackMutationType: StackMutationType;
export declare function capitalize(str: string): string;
interface IResourcePaths {
  localPreBuildCfnFile: string;
  cloudPreBuildCfnFile: string;
  localBuildCfnFile: string;
  cloudBuildCfnFile: string;
}
export declare function globCFNFilePath(fileFolder: string): string;
export declare class ResourceDiff {
  resourceName: string;
  category: string;
  provider: string;
  service: string;
  resourceFiles: IResourcePaths;
  localBackendDir: string;
  cloudBackendDir: string;
  localTemplate: Template;
  cloudTemplate: Template;
  mutationInfo: StackMutationInfo;
  constructor(category: string, resourceName: string, provider: string, mutationInfo: StackMutationInfo);
  printResourceDetailStatus: (mutationInfo: StackMutationInfo) => Promise<void>;
  calculateCfnDiff: () => Promise<cfnDiff.TemplateDiff>;
  private safeReadCFNTemplate;
  private getCfnResourceFilePaths;
  private normalizeProviderForFileNames;
  private printStackDiff;
  private safeGlobCFNFilePath;
  private isResourceTypeCDKMetada;
}
export interface IResourceDiffCollection {
  updatedDiff: ResourceDiff[] | [];
  deletedDiff: ResourceDiff[] | [];
  createdDiff: ResourceDiff[] | [];
}
export interface ICategoryStatusCollection {
  resourcesToBeCreated: any[];
  resourcesToBeUpdated: any[];
  resourcesToBeDeleted: any[];
  resourcesToBeSynced: any[];
  rootStackUpdated?: boolean;
  allResources: any[];
  tagsUpdated: boolean;
}
export declare function CollateResourceDiffs(resources: any, mutationInfo: StackMutationInfo): Promise<ResourceDiff[]>;
export {};
//# sourceMappingURL=resource-status-diff.d.ts.map
