import { IContract } from 'drizzle';

import daiABI from 'blockchain/abi/dai.json';
import C2FCFull from 'contracts/C2FCFull.json';
import { NETWORK_CONFIG } from './network';

function getNetworks(contractAddress: string) {
  const defaultNetwork = { address: contractAddress };
  return new Proxy({}, {
    get: () => defaultNetwork,
  });
}

export const contracts: IContract[] = [
  {
    contractName: 'DAI',
    abi: daiABI as IContract['abi'],
    networks: getNetworks(NETWORK_CONFIG.daiContract),
  },
  {
    ...C2FCFull,
    networks: getNetworks(NETWORK_CONFIG.c2fcContract),
  } as IContract,
];
