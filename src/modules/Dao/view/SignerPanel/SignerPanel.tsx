import React from 'react';
import Web3 from 'web3';
import { bind } from 'decko';
import { SidePanel } from '@aragon/ui';
import { ITransactionBag, ITransaction, IFrontendAragonApp } from '@aragon/types';

import { NETWORK_CONFIG } from 'core/constants';
import { addressesEqual, getInjectedProvider } from 'shared/helpers/web3';

import ConfirmTransaction from './ConfirmTransaction';
import SigningStatus from './SigningStatus';
import { IIntent } from '../types';

interface IProps {
  apps: IFrontendAragonApp[];
  account: string | null;
  transactionBag: ITransactionBag | null;
  walletNetwork: string;
  walletWeb3: Web3;
  walletProviderId: string;
  daoName: string;
  onClose(): void;
  onTransactionSuccess(transaction: ITransaction): void;
  onRequestEnable(): void;
}

interface IState {
  panelOpened: boolean;
  intent: IIntent | null;
  directPath: boolean;
  actionPaths: ITransaction[][];
  pretransaction: ITransaction | null;
  status: 'confirming' | 'signing' | 'signed' | 'error';
  signError: any;
}

const INITIAL_STATE: IState = {
  panelOpened: false,
  intent: null,
  directPath: false,
  actionPaths: [],
  pretransaction: null,
  status: 'confirming',
  signError: null,
};

class SignerPanel extends React.Component<IProps, IState> {
  public state: IState = { ...INITIAL_STATE };
  private _closeTimer: number = 0;

  public componentWillReceiveProps({ transactionBag }: IProps) {
    // Received a new transaction to sign
    if (transactionBag && transactionBag !== this.props.transactionBag) {
      this.setState({
        ...INITIAL_STATE,
        panelOpened: true,
        status: 'confirming',

        // When Aragon.js starts returning the new format (see
        // stateFromTransactionBag), we can simply search and replace this
        // function with `transactionBag`.
        ...this.stateFromTransactionBag(transactionBag),
      });
    }
  }

  public componentDidUpdate(_prevProps: IProps, prevState: IState) {
    const { status } = this.state;
    if (prevState.status !== status && status !== 'signed') {
      clearTimeout(this._closeTimer);
    }
  }

  public render() {
    const {
      account,
      onRequestEnable,
      walletNetwork,
      walletProviderId,
      daoName,
    } = this.props;

    const {
      panelOpened,
      signError,
      intent,
      directPath,
      actionPaths,
      pretransaction,
      status,
    } = this.state;

    return (
      <SidePanel
        onClose={this.handleSignerClose}
        onTransitionEnd={this.handleSignerTransitionEnd}
        opened={panelOpened}
        title="Create transaction"
      >
        {status === 'confirming'
          ? (
            <ConfirmTransaction
              direct={directPath}
              hasAccount={Boolean(account)}
              hasWeb3={Boolean(getInjectedProvider())}
              intent={intent}
              daoName={daoName}
              networkType={NETWORK_CONFIG.type}
              onClose={this.handleSignerClose}
              onRequestEnable={onRequestEnable}
              onSign={this.handleSign}
              paths={actionPaths}
              pretransaction={pretransaction}
              signingEnabled={status === 'confirming'}
              walletNetworkType={walletNetwork}
              walletProviderId={walletProviderId}
            />
          ) : (
            <SigningStatus
              status={status}
              signError={signError}
              onClose={this.handleSignerClose}
              walletProviderId={walletProviderId}
            />
          )
        }
      </SidePanel>
    );
  }

  // This is a temporary method to reshape the transaction bag
  // to the future format we expect from Aragon.js
  private stateFromTransactionBag(bag: ITransactionBag) {
    const { path, transaction } = bag;
    return {
      intent: transaction && this.transactionIntent(bag),
      directPath: path.length === 1,
      actionPaths: path.length ? [path] : [],
      pretransaction: (transaction && transaction.pretransaction) || null,
    };
  }

  private transactionIntent({ path, transaction }: ITransactionBag): IIntent {
    if (path.length > 1) {
      // If the path includes forwarders, the intent is always the last node
      const lastNode = path[path.length - 1];
      // tslint:disable-next-line:no-shadowed-variable
      const { description, name, to, annotatedDescription } = lastNode;
      return { annotatedDescription, description, name, to, transaction };
    }

    // Direct path
    const { apps } = this.props;
    const { annotatedDescription, description, to } = transaction;
    const toApp = apps.find(app => addressesEqual(app.proxyAddress, to));
    const name = (toApp && toApp.name) || '';

    return { annotatedDescription, description, name, to, transaction };
  }

  private async signTransaction(transaction: ITransaction, _intent: IIntent): Promise<string> {
    const { walletWeb3 } = this.props;
    return new Promise<string>((resolve, reject) => {
      walletWeb3.eth.sendTransaction(transaction, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  @bind
  private async handleSign(transaction: ITransaction, intent: IIntent, pretransaction: ITransaction | null) {
    const { transactionBag, onTransactionSuccess } = this.props;

    this.setState({ status: 'signing' });

    try {
      if (pretransaction) {
        await this.signTransaction(pretransaction, intent);
      }

      const transactionRes = await this.signTransaction(transaction, intent);
      // Create new notification
      onTransactionSuccess && onTransactionSuccess(transaction);

      transactionBag && transactionBag.accept(transactionRes);
      this.setState({ signError: null, status: 'signed' });
      this.startClosing();

      // Display an error in the panel if a transaction fail
    } catch (err) {
      transactionBag && transactionBag.reject(err);
      this.setState({ signError: err, status: 'error' });

      // TODO: the ongoing notification should be flagged faulty at this point ...
    }
  }

  private startClosing() {
    this._closeTimer = window.setTimeout(() => {
      if (this.state.status === 'signed') {
        this.handleSignerClose();
      }
    }, 3000);
  }

  @bind
  private handleSignerClose() {
    this.setState({ panelOpened: false });
    this.props.onClose && this.props.onClose();
    this.handleSignerTransitionEnd(false);
  }

  @bind
  private handleSignerTransitionEnd(opened: boolean) {
    // Reset signer state only after it has finished transitioning out
    if (!opened) {
      this.setState({ ...INITIAL_STATE });
    }
  }
}

export default SignerPanel;
