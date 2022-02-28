export declare enum AmplifyEvent {
  PreInit = 'PreInit',
  PostInit = 'PostInit',
  PrePush = 'PrePush',
  PostPush = 'PostPush',
  PrePull = 'PrePull',
  PostPull = 'PostPull',
  PostEnvAdd = 'PostEnvAdd',
  PreCodegenModels = 'PreCodegenModels',
  PostCodegenModels = 'PostCodegenModels',
  InternalOnlyPostEnvRemove = 'InternalOnlyPostEnvRemove',
}
export declare class AmplifyEventData {}
export declare class AmplifyPreInitEventData extends AmplifyEventData {}
export declare class AmplifyPostInitEventData extends AmplifyEventData {}
export declare class AmplifyPrePushEventData extends AmplifyEventData {}
export declare class AmplifyPostPushEventData extends AmplifyEventData {}
export declare class AmplifyPrePullEventData extends AmplifyEventData {}
export declare class AmplifyPostPullEventData extends AmplifyEventData {}
export declare class AmplifyPreCodegenModelsEventData extends AmplifyEventData {}
export declare class AmplifyPostCodegenModelsEventData extends AmplifyEventData {}
export declare class AmplifyInternalOnlyPostEnvRemoveEventData extends AmplifyEventData {
  readonly envName: string;
  constructor(envName: string);
}
export declare class AmplifyPostEnvAddEventData extends AmplifyEventData {
  readonly prevEnvName: string;
  readonly newEnvName: string;
  constructor(prevEnvName: string, newEnvName: string);
}
export declare class AmplifyEventArgs {
  event: AmplifyEvent;
  data?: AmplifyEventData | undefined;
  constructor(event: AmplifyEvent, data?: AmplifyEventData | undefined);
}
//# sourceMappingURL=amplify-event.d.ts.map
