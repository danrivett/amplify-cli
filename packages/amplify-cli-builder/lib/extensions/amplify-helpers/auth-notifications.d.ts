import { $TSContext } from 'amplify-cli-core';
import { DocumentNode } from 'graphql';
export declare function notifyFieldAuthSecurityChange(context: $TSContext): Promise<void>;
export declare function displayAuthNotification(directiveMap: any, fieldDirectives: Set<string>): boolean;
export declare function hasFieldAuthDirectives(doc: DocumentNode): Set<string>;
export declare function notifySecurityEnhancement(context: any): Promise<void>;
//# sourceMappingURL=auth-notifications.d.ts.map
