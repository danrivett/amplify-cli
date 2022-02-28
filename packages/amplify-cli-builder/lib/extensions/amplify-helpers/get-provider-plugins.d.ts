import { $TSContext } from 'amplify-cli-core';
export declare function getProviderPlugins(context: $TSContext): Record<string, string>;
export declare const getConfiguredProviders: (context: $TSContext) => Record<string, string>;
export declare const executeProviderCommand: (context: $TSContext, command: string, args?: unknown[]) => Promise<void>;
//# sourceMappingURL=get-provider-plugins.d.ts.map
