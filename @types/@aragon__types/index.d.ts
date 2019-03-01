
declare module '@aragon/types' {
  import { provider } from 'web3-providers';

  export type Provider = Exclude<provider, string>;

  export interface IFrontendAragonApp extends IAragonApp {
    apmRegistry: string;
    baseUrl: string;
    hasWebApp: boolean;
    src: string;
    tags?: Array<string | null> | null;
  }

  export interface IAragonApp {
    abi?: IAbi[] | null;
    appId: string;
    appName?: string | null;
    codeAddress: string;
    content?: IAragonAppContent | null;
    contractAddress?: string | null;
    dependencies?: IAragonAppDependency[] | null;
    description?: string | null;
    environments?: Record<string, IEnvironment> | null;
    functions?: IAragonAppFunction[] | null;
    icons?: IAragonAppIcon[] | null;
    identifier?: string | null;
    isAragonOsInternalApp?: boolean | null;
    isForwarder?: boolean | null;
    kernelAddress?: string | null;
    name: string;
    path?: string | null;
    proxyAddress: string;
    roles?: IAragonRole[] | null;
    script?: string | null;
    start_url?: string | null;
    status?: string | null;
    version?: string | null;
  }

  export interface IAbi {
    constant?: boolean | null;
    inputs?: Array<IAbiInput | null> | null;
    name?: string | null;
    outputs?: Array<IAbiOutput | null> | null;
    payable?: boolean | null;
    stateMutability?: string | null;
    type: string;
    signature?: string | null;
    anonymous?: boolean | null;
  }

  export interface IAbiInput {
    name: string;
    type: string;
    indexed?: boolean | null;
  }

  export interface IAbiOutput {
    name: string;
    type: string;
  }

  export interface IAragonRole {
    name: string;
    id: string;
    params?: Array<string | null> | null;
    bytes: string;
  }

  export interface IAragonAppFunction {
    sig: string;
    roles?: Array<string | null> | null;
    notice?: string | null;
  }

  export interface IAragonAppIcon {
    src: string;
    sizes: string;
  }

  export interface IEnvironment {
    registry: string;
    appName: string;
    network: string;
  }

  export interface IAragonAppContent {
    provider: string;
    location: string;
  }

  export interface IAragonAppDependency {
    appName: string;
    version: string;
    initParam: string;
    state: string;
    requiredPermissions?: IAragonAppPermission[] | null;
  }

  export interface IAragonAppPermission {
    name: string;
    params: string;
  }

  export interface IAragonWeb3Providers {
    default: Provider;
    wallet: Provider;
  }

  type Address = string;

  export type IAragonPermissions = {
    [A in Address] : {
      [Something: string]: {
        manager: Address;
        allowedEntities: Address[];
      },
    }
  };

  export interface ITransactionBag {
    transaction: ITransaction;
    path?: ITransaction[] | null;
    accept(txHash: string): void;
    reject(error: any): void;
  }

  export interface ITransaction {
    from: string;
    to: string;
    data: string;
    gas?: number | null;
    gasPrice?: string | null;
    description: string;
    name: string;
    identifier: string;
    annotatedDescription?: IAnnotatedDescriptionEntity[] | null;
  }

  export interface IAnnotatedDescriptionEntity {
    type: string;
    value: string;
  }
}
