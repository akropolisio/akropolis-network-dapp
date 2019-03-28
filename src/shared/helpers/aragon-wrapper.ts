import BN from 'bn.js';
import { Subscription } from 'rxjs';
import { NonNullableProps } from '_helpers';
import throttle from 'lodash.throttle';
import resolvePathname from 'resolve-pathname';
import AragonWrapper, { providers, isNameUsed, ensResolve, IpfsConfig } from '@aragon/wrapper';
import { IFrontendAragonApp, IAragonApp, IAragonPermissions, ITransactionBag } from '@aragon/types';

import { NETWORK_CONFIG, web3Providers, defaultGasPriceFn } from 'core/constants';
import { Provider } from 'shared/types/models';
import { noop, removeStartingSlash, appendTrailingSlash } from './utils';
import { getWeb3, getUnknownBalance, getMainAccount, isValidEnsName } from './web3';
import { getBlobUrl, WorkerSubscriptionPool } from './worker-utils';
import { NoConnection, DAONotFound } from './errors';

const POLL_DELAY_ACCOUNT = 2000;
const POLL_DELAY_NETWORK = 2000;
const POLL_DELAY_CONNECTIVITY = 2000;

/*
 * Supported locations:
 *   ipfs:{IPFS_HASH}
 *   http:{HOST}
 *   http:{HOST}:{PORT}
 *   http:{HOST}:{PORT}/{PATH}
 *   http:http(s)://{HOST}
 *   http:http(s)://{HOST}:{PORT}
 *   http:http(s)://{HOST}:{PORT}/{PATH}
 */
const appBaseUrl = (app: IAragonApp, gateway: string = NETWORK_CONFIG.defaultIpfsConfig.gateway) => {
  if (!app.content) {
    return '';
  }

  const { provider, location } = app.content;
  if (provider === 'ipfs') {
    return `${gateway}/${location}/`;
  }
  if (provider === 'http') {
    return /^https?:\/\//.test(location)
      ? appendTrailingSlash(location)
      : `http://${location}/`;
  }
  return '';
};

// Sort apps, and attach data useful to the frontend
const prepareAppsForFrontend = (apps: IAragonApp[], gateway: string): IFrontendAragonApp[] => {
  const hasWebApp = (app: IAragonApp) => Boolean(app.start_url);

  const getAPMRegistry = (app: IAragonApp) => {
    const appName = app.appName || '';
    return appName.substr(appName.indexOf('.') + 1); // everything after the first '.'
  };

  const getAppTags = (app: IAragonApp) => {
    const apmRegistry = getAPMRegistry(app);

    const tags = [];
    if (app.status) {
      tags.push(app.status);
    }
    if (apmRegistry !== 'aragonpm.eth') {
      tags.push(`${apmRegistry} registry`);
    }
    if (!hasWebApp(app)) {
      tags.push('contract-only');
    }

    return tags;
  };

  return apps
    .map(app => {
      const baseUrl = appBaseUrl(app, gateway);
      // Remove the starting slash from the start_url field
      // so the absolute path can be resolved from baseUrl.
      const startUrl = removeStartingSlash(app.start_url || '');
      const src = baseUrl ? resolvePathname(startUrl, baseUrl) : '';

      return {
        ...app,
        src,
        baseUrl,
        apmRegistry: getAPMRegistry(app),
        hasWebApp: hasWebApp(app),
        tags: getAppTags(app),
      };
    });
};

const pollEvery = <I extends any[], Res>(
  fn: (...args: I) => { request: () => Promise<Res>, onResult: (result: Res) => void },
  delay: number,
) => {
  let timer = -1;
  let stop = false;
  const poll = async (request: () => Promise<Res>, onResult: (result: Res) => void) => {
    const result = await request();
    if (!stop) {
      onResult(result);
      timer = window.setTimeout(() => poll(request, onResult), delay);
    }
  };
  return (...params: I) => {
    const { request, onResult } = fn(...params);
    poll(request, onResult);
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  };
};

// Filter the value we get from getBalance() before passing it to BN.js.
// This is because passing some values to BN.js can lead to an infinite loop
// when .toString() is called. Returns "-1" when the value is invalid.
//
// See https://github.com/indutny/bn.js/issues/186
const filterBalanceValue = (value: BN | string | null) => {
  if (value === null) {
    return '-1';
  }
  if (typeof value === 'object') {
    value = String(value);
  }
  if (typeof value === 'string') {
    return /^[0-9]+$/.test(value) ? value : '-1';
  }
  return '-1';
};

interface IPollMainAccountHandlers {
  onAccount(account: string | null): void;
  onBalance(balance: BN): void;
}

interface IPollMainAccountResult {
  account: string | null;
  balance: BN;
}

// Keep polling the main account.
// See https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#ear-listening-for-selected-account-changes
export const pollMainAccount = pollEvery<[Provider, IPollMainAccountHandlers], IPollMainAccountResult>(
  (provider, { onAccount, onBalance }) => {
    const web3 = getWeb3(provider);
    let lastAccount: string | null = null;
    let lastBalance = getUnknownBalance();

    return {
      request: async () => {
        const account = await getMainAccount(web3);
        if (!account) {
          return { account: null, balance: getUnknownBalance() };
        }
        // TODO ds: remove type crutch after web3 updating
        const balance = await web3.eth.getBalance(account) as any as string;
        return { account, balance: new BN(filterBalanceValue(balance)) };
      },
      onResult: ({ account, balance }) => {
        if (account !== lastAccount) {
          lastAccount = account;
          onAccount(account);
        }
        if (!balance.eq(lastBalance)) {
          lastBalance = balance;
          onBalance(balance);
        }
      },
    };
  },
  POLL_DELAY_ACCOUNT,
);

export const pollConnectivity = pollEvery<[Provider[], (isConnected: boolean) => void], boolean>(
  (checkedProviders, onConnectivity) => {
    let lastFound: boolean | null = null;
    return {
      request: async () => {
        try {
          await Promise.all(
            // TODO ds: remove 'as any' after web3 update
            checkedProviders.map(p => (getWeb3(p).eth.net as any).getNetworkType()),
          );
          return true;
        } catch (err) {
          return false;
        }
      },
      onResult: connected => {
        if (connected !== lastFound) {
          lastFound = connected;
          onConnectivity(connected);
        }
      },
    };
    // web.eth.net.isListening()
  },
  POLL_DELAY_CONNECTIVITY,
);

// Keep polling the network.
export const pollNetwork = pollEvery<[Provider, (network: string) => void], string>((provider, onNetwork) => {
  const web3 = getWeb3(provider);
  let lastFound: string | null = null;
  return {
    request: () => (web3.eth.net as any).getNetworkType(), // TODO ds: remove 'as any' after web3 update
    onResult: network => {
      if (network !== lastFound) {
        lastFound = network;
        onNetwork(network);
      }
    },
  };
}, POLL_DELAY_NETWORK);

interface ISubscribeWrapperHandlers {
  onApps(apps: IFrontendAragonApp[]): void;
  onPermissions(perms: IAragonPermissions): void;
  onForwarders(apps: IAragonApp[]): void;
  onTransactionBag(transactionsBag: ITransactionBag): void;
}

// Subscribe to aragon.js observables
const subscribe = (
  wrapper: AragonWrapper,
  { onApps, onPermissions, onForwarders, onTransactionBag }: ISubscribeWrapperHandlers,
  { ipfsConf }: { ipfsConf: IpfsConfig },
) => {
  const { apps, permissions, forwarders, transactions } = wrapper;

  const workerSubscriptionPool = new WorkerSubscriptionPool();

  const subscriptions = {
    apps: apps.subscribe(nextApps => {
      onApps(
        prepareAppsForFrontend(
          nextApps,
          ipfsConf.gateway,
        ),
      );
    }),
    permissions: permissions.subscribe(throttle(onPermissions, 100)),
    connectedApp: null as (Subscription | null),
    connectedWorkers: workerSubscriptionPool,
    forwarders: forwarders.subscribe(onForwarders),
    transactions: transactions.subscribe(onTransactionBag),
    workers: apps.subscribe(nextApps => {
      // Asynchronously launch webworkers for each new app that has a background
      // script defined
      nextApps
        .filter((app): app is NonNullableProps<IAragonApp, 'script'> => Boolean(app.script))
        .filter(
          ({ proxyAddress }) => !workerSubscriptionPool.hasWorker(proxyAddress),
        )
        .forEach(async app => {
          const { name, proxyAddress, script } = app;
          const baseUrl = appBaseUrl(app, ipfsConf.gateway);

          // If the app URL is empty, the script can’t be retrieved
          if (!baseUrl) {
            return;
          }

          // Remove the starting slash from the script field to force it to
          // load relative to the app's base url
          const scriptUrl = resolvePathname(
            removeStartingSlash(script),
            baseUrl,
          );

          let workerUrl = '';
          try {
            // WebWorkers can only load scripts from the local origin, so we
            // have to fetch the script as text and make a blob out of it
            workerUrl = await getBlobUrl(scriptUrl);
          } catch (e) {
            console.error(
              `Failed to load ${name}(${proxyAddress})'s script (${script}): `,
              e,
            );
            return;
          }

          // If another execution context already loaded this app's worker
          // before we got to it here, let's short circuit
          if (!workerSubscriptionPool.hasWorker(proxyAddress)) {
            const worker = new Worker(workerUrl);
            worker.addEventListener(
              'error',
              err =>
                console.error(
                  `Error from worker for ${name}(${proxyAddress}):`,
                  err,
                ),
              false,
            );

            const provider = new providers.MessagePortMessage(worker);
            workerSubscriptionPool.addWorker(
              app,
              wrapper.runApp(provider, proxyAddress).shutdown,
              worker,
            );
          }

          // Clean up the url we created to spawn the worker
          URL.revokeObjectURL(workerUrl);
        });
    }),
  };

  return subscriptions;
};

const resolveEnsDomain: typeof ensResolve = async (domain, opts) => {
  try {
    return await ensResolve(domain, opts);
  } catch (err) {
    if (err.message === 'ENS name not defined.') {
      return '';
    }
    throw err;
  }
};

interface IInitWrapperOptions {
  onError?(error: any): void;
  onApps?(apps: IFrontendAragonApp[]): void;
  onPermissions?(perms: IAragonPermissions): void;
  onForwarders?(apps: IAragonApp[]): void;
  onTransactionBag?(transactionBag: ITransactionBag): void;
  onDaoAddress?(dao: { address: string, domain: string }): void;
}

const initWrapper = async (
  dao: string,
  {
    onApps = noop,
    onPermissions = noop,
    onForwarders = noop,
    onTransactionBag = noop,
    onDaoAddress = noop,
  }: IInitWrapperOptions,
): Promise<AragonWrapper> => {
  const ensRegistryAddress = NETWORK_CONFIG.aragonEnsRegistry;
  const ipfsConf = NETWORK_CONFIG.defaultIpfsConfig;
  const provider = web3Providers.default;
  const walletProvider = web3Providers.wallet;

  const isDomain = isValidEnsName(dao);
  const daoAddress = isDomain
    ? await resolveEnsDomain(dao, {
      provider,
      registryAddress: ensRegistryAddress,
    })
    : dao;

  if (!daoAddress) {
    throw new DAONotFound(dao);
  }

  onDaoAddress({ address: daoAddress, domain: dao });

  const wrapper = new AragonWrapper(daoAddress, {
    provider,
    defaultGasPriceFn,
    apm: {
      ensRegistryAddress,
      ipfs: ipfsConf,
    },
  });

  const web3 = getWeb3(walletProvider || provider);

  const account = await getMainAccount(web3);
  try {
    await wrapper.init({
      accounts: {
        providedAccounts: account ? [account] : [],
      },
    });
  } catch (err) {
    if (err.message === 'Provided daoAddress is not a DAO') {
      throw new DAONotFound(dao);
    }
    if (err.message === 'connection not open') {
      throw new NoConnection('The wrapper can not be initialized without a connection');
    }
    throw err;
  }

  const subscriptions = subscribe(
    wrapper,
    { onApps, onPermissions, onForwarders, onTransactionBag },
    { ipfsConf },
  );

  wrapper.connectAppIFrame = (iframeElt: HTMLIFrameElement, proxyAddress: string) => {
    const windowMessageProvider = new providers.WindowMessage(iframeElt.contentWindow);
    const result = wrapper.runApp(windowMessageProvider, proxyAddress);
    if (subscriptions.connectedApp) {
      subscriptions.connectedApp.unsubscribe();
    }
    subscriptions.connectedApp = result.shutdown;
    return result;
  };

  wrapper.cancel = () => {
    Object.values(subscriptions).forEach(subscription => {
      if (subscription) {
        subscription.unsubscribe();
      }
    });
  };

  return wrapper;
};

// const templateParamFilters = {
//   democracy: (
//     // name: String of organization name
//     // supportNeeded: BN between 0 (0%) and 1e18 - 1 (99.99...%).
//     // minAcceptanceQuorum: BN between 0 (0%) and 1e18 - 1(99.99...%).
//     // voteDuration: Duration in seconds.
//     { name, supportNeeded, minAcceptanceQuorum, voteDuration },
//     account,
//   ) => {
//     const percentageMax = new BN(10).pow(new BN(18));
//     if (
//       supportNeeded.gte(percentageMax) ||
//       minAcceptanceQuorum.gte(percentageMax)
//     ) {
//       throw new Error(
//         `supported needed ${supportNeeded.toString()} and minimum acceptance` +
//         `quorum (${minAcceptanceQuorum.toString()}) must be below 100%`,
//       );
//     }

//     const tokenBase = new BN(10).pow(new BN(18));
//     const holders = [{ address: account, balance: 1 }];

//     const [accounts, stakes] = holders.reduce(
//       ([accounts, stakes], holder) => [
//         [...accounts, holder.address],
//         [...stakes, tokenBase.muln(holder.balance)],
//       ],
//       [[], []],
//     );

//     return [
//       name,
//       accounts,
//       stakes,
//       supportNeeded,
//       minAcceptanceQuorum,
//       voteDuration,
//     ];
//   },

//   multisig: (
//     // name: String of organization name
//     // signers: Accounts corresponding to the signers.
//     // neededSignatures: Minimum number of signatures needed.
//     { name, signers, neededSignatures },
//     account,
//   ) => {
//     if (!signers || signers.length === 0) {
//       throw new Error('signers should contain at least one account:', signers);
//     }

//     if (neededSignatures < 1 || neededSignatures > signers.length) {
//       throw new Error(
//         `neededSignatures must be between 1 and the total number of signers (${
//         signers.length
//         })`,
//         neededSignatures,
//       );
//     }

//     return [name, signers, neededSignatures];
//   },
// };

export const isNameAvailable = async (name: string) =>
  !(await isNameUsed(name, {
    provider: web3Providers.default,
    registryAddress: NETWORK_CONFIG.aragonEnsRegistry,
  }));

// export const initDaoBuilder = (
//   provider,
//   ensRegistryAddress,
//   ipfsConf = NETWORK_CONFIG.defaultIpfsConfig,
// ) => {
//   // DEV only
//   // provider = new Web3.providers.WebsocketProvider('ws://localhost:8546')

//   return {
//     build: async (templateName, organizationName, settings = {}) => {
//       if (!organizationName) {
//         throw new Error('No organization name set');
//       }
//       if (!templateName || !templateParamFilters[templateName]) {
//         throw new Error('The template name doesn’t exist');
//       }

//       const web3 = getWeb3(provider);
//       const account = await getMainAccount(web3);

//       if (account === null) {
//         throw new Error(
//           'No accounts detected in the environment (try to unlock your wallet)',
//         );
//       }

//       const templates = setupTemplates(account, {
//         provider,
//         defaultGasPriceFn,
//         apm: {
//           ensRegistryAddress,
//           ipfs: ipfsConf,
//         },
//       });
//       const templateFilter = templateParamFilters[templateName];
//       const templateInstanceParams = templateFilter(
//         { name: organizationName, ...settings },
//         account,
//       );
//       const tokenParams = [settings.tokenName, settings.tokenSymbol];

//       return templates.newDAO(
//         templateName,
//         { params: tokenParams },
//         { params: templateInstanceParams },
//       );
//     },
//   };
// };

export default initWrapper;
