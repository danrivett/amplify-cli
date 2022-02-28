import { ViewResourceTableParams } from 'amplify-cli-core';
import * as resourceStatus from './resource-status-diff';
export declare function getMultiCategoryStatus(
  inputs: ViewResourceTableParams | undefined,
): Promise<resourceStatus.ICategoryStatusCollection>;
export declare function getResourceDiffs(
  resourcesToBeUpdated: any,
  resourcesToBeDeleted: any,
  resourcesToBeCreated: any,
): Promise<resourceStatus.IResourceDiffCollection>;
export declare function getSummaryTableData({
  resourcesToBeUpdated,
  resourcesToBeDeleted,
  resourcesToBeCreated,
  resourcesToBeSynced,
  allResources,
}: {
  resourcesToBeUpdated: any;
  resourcesToBeDeleted: any;
  resourcesToBeCreated: any;
  resourcesToBeSynced: any;
  allResources: any;
}): string[][];
export declare function getResourceStatus(
  category?: any,
  resourceName?: any,
  providerName?: any,
  filteredResources?: any,
): Promise<resourceStatus.ICategoryStatusCollection>;
export declare function getAllResources(amplifyMeta: any, category: any, resourceName: any, filteredResources: any): any[];
export declare function getResourcesToBeCreated(
  amplifyMeta: any,
  currentAmplifyMeta: any,
  category: any,
  resourceName: any,
  filteredResources: any,
): any[];
export declare function getResourcesToBeDeleted(
  amplifyMeta: any,
  currentAmplifyMeta: any,
  category: any,
  resourceName: any,
  filteredResources: any,
): any[];
export declare function getResourcesToBeUpdated(
  amplifyMeta: any,
  currentAmplifyMeta: any,
  category: any,
  resourceName: any,
  filteredResources: any,
): Promise<any[]>;
export declare function getResourcesToBeSynced(
  amplifyMeta: any,
  currentAmplifyMeta: any,
  category: any,
  resourceName: any,
  filteredResources: any,
): any[];
export declare function getAmplifyMeta(): {
  amplifyMeta: any;
  currentAmplifyMeta: any;
};
export declare function getHashForResourceDir(dirPath: any, files?: string[]): Promise<string>;
export declare function getResourceService(category: string, resourceName: string): any;
//# sourceMappingURL=resource-status-data.d.ts.map
