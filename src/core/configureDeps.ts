import { Store } from 'redux';
import { Drizzle, generateStore, IDrizzleOptions } from 'drizzle';

import Api from 'services/api/Api';
import { IDependencies, IAppReduxState } from 'shared/types/app';

import { LocalStorage } from 'services/storage';

import { RPCSubprovider, Web3ProviderEngine, ContractWrappers } from '0x.js';
import { HttpClient } from '@0x/connect';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { MetamaskSubprovider } from '@0x/subproviders';
import { NETWORK_CONFIG, RELAYER_URL, contracts, web3Providers } from './constants';

export default function configureDeps(_store: Store<IAppReduxState>): IDependencies {
  const api = new Api('/api');

  const options: IDrizzleOptions = { contracts };
  const drizzleStore = generateStore(options);
  const drizzle = new Drizzle(options, drizzleStore);
  const storage = new LocalStorage('v1');

  const providerEngine = new Web3ProviderEngine();
  providerEngine.addProvider(new MetamaskSubprovider(web3Providers.wallet as any));
  providerEngine.addProvider(new RPCSubprovider(NETWORK_CONFIG.rpcUrl));
  providerEngine.start();

  const web3Wrapper = new Web3Wrapper(providerEngine);
  const contractWrappers = new ContractWrappers(providerEngine, { networkId: NETWORK_CONFIG.id });
  const client0x = new HttpClient(RELAYER_URL);

  return {
    api,
    drizzle,
    storage,
    Ox: {
      providerEngine,
      client: client0x,
      contractWrappers,
      web3Wrapper,
    },
  };
}
