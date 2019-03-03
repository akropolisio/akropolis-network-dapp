import BN from 'bn.js';
import { useEffect, useState } from 'react';
import { web3Providers } from 'core/constants';
import AragonWrapper from '@aragon/wrapper';

import useOnChangeState from './useOnChangeState';
import { getUnknownBalance } from '../web3';
import { pollMainAccount, pollConnectivity, pollNetwork } from '../aragon-wrapper';

interface InjectProps {
  account: string | null;
  balance: BN;
  walletNetwork: string;
  connected: boolean;
}

const defaultProps: InjectProps = {
  account: null,
  balance: getUnknownBalance(),
  walletNetwork: '',
  connected: false,
};

export default function usePoolNetwork(wrapper: AragonWrapper | null): InjectProps {
  const [account, setAccount] = useState(defaultProps.account);
  const [balance, setBalance] = useState(defaultProps.balance);
  const [walletNetwork, setWalletNetwork] = useState(defaultProps.walletNetwork);
  const [connected, setConnected] = useState(defaultProps.connected);

  useOnChangeState<[AragonWrapper | null, string | null]>(
    [wrapper, account],
    ([prevWrapper, prevAccount], [nextWrapper, nextAccount]) => !!nextAccount && (
      (!!nextWrapper && prevWrapper !== nextWrapper) ||
      (!!nextWrapper && prevAccount !== nextAccount)
    ),
    (_, [nextWrapper, nextAccount]) =>
      nextWrapper && nextAccount && nextWrapper.setAccounts([nextAccount]),
    [wrapper, account],
  );

  useEffect(() => pollMainAccount(web3Providers.wallet, {
    onAccount: setAccount,
    onBalance: setBalance,
  }), []);

  useEffect(() => pollNetwork(web3Providers.wallet, setWalletNetwork), []);
  useEffect(() => pollConnectivity([web3Providers.wallet, web3Providers.default], setConnected), []);

  return { account, balance, walletNetwork, connected };
}
