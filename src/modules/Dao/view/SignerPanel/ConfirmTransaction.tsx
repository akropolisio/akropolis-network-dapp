import React from 'react';
import styled from 'styled-components';
import { ITransaction } from '@aragon/types';
import { Info, SafeLink, theme } from '@aragon/ui';
import getProviderString from 'shared/helpers/providerStrings';
import { isElectron } from 'shared/helpers/utils';

import ActionPathsContent from './ActionPathsContent';
import SignerButton from './SignerButton';
import AddressLink from './AddressLink';
import { IIntent } from '../types';

interface IProps {
  direct: boolean;
  hasAccount: boolean;
  hasWeb3: boolean;
  intent: IIntent | null;
  daoName: string;
  networkType: string;
  paths: ITransaction[][];
  pretransaction: ITransaction | null;
  signError?: string | null;
  signingEnabled: boolean;
  walletNetworkType: string;
  walletProviderId: string;
  onClose(): void;
  onRequestEnable(): void;
  onSign(transaction: ITransaction, intent: IIntent, pretransaction: ITransaction | null): void;
}

class ConfirmTransaction extends React.Component<IProps> {
  public render() {
    const {
      direct,
      hasAccount,
      hasWeb3,
      intent,
      daoName,
      networkType,
      onClose,
      onRequestEnable,
      onSign,
      paths,
      pretransaction,
      signError,
      signingEnabled,
      walletNetworkType,
      walletProviderId,
    } = this.props;

    if (!hasWeb3) {
      if (isElectron()) {
        return (
          <Web3ProviderError
            intent={intent}
            onClose={onClose}
            neededText="You need to have Frame installed and enabled"
            actionText={
              <span>
                Please install and enable{' '}
                <SafeLink href="https://frame.sh/" target="_blank">
                  Frame
                </SafeLink>
                .
              </span>
            }
          />
        );
      }
      return (
        <Web3ProviderError
          intent={intent}
          onClose={onClose}
          neededText="You need to have an Ethereum provider installed and enabled"
          actionText={
            <span>
              Please install and enable{' '}
              <SafeLink href="https://metamask.io/" target="_blank">
                Metamask
              </SafeLink>
              .
            </span>
          }
        />
      );
    }

    if (!hasAccount) {
      return (
        <Web3ProviderError
          intent={intent}
          onClose={onClose}
          neededText={`You need to unlock and enable ${getProviderString(
            'your Ethereum provider',
            walletProviderId,
          )}`}
          actionText={
            <span>
              Please unlock and{' '}
              <ButtonLink onClick={onRequestEnable}>enable</ButtonLink>{' '}
              {getProviderString('your Ethereum provider', walletProviderId)}.
            </span>
          }
        />
      );
    }

    if (walletNetworkType !== networkType) {
      return (
        <Web3ProviderError
          intent={intent}
          onClose={onClose}
          neededText={`
            You need to be connected to the ${networkType} network
          `}
          actionText={`
            Please connect ${getProviderString(
            'your Ethereum provider',
            walletProviderId,
          )} to the ${networkType} network.
          `}
        />
      );
    }

    const possible =
      (direct || (Array.isArray(paths) && paths.length)) && !signError;

    return possible && intent ? (
      <ActionPathsContent
        intent={intent}
        direct={direct}
        daoName={daoName}
        onSign={onSign}
        paths={paths}
        pretransaction={pretransaction}
        signingEnabled={signingEnabled}
        walletProviderId={walletProviderId}
      />
    ) : (
        <ImpossibleContent error={!!signError} intent={intent} onClose={onClose} />
      );
  }
}

interface IImpossibleContentProps {
  error: boolean;
  intent: IIntent | null;
  onClose(): void;
}

function ImpossibleContent({ error, intent, onClose }: IImpossibleContentProps) {
  const { description, name, to = '' }: Partial<IIntent> = intent || {};
  return (
    <React.Fragment>
      <Info.Permissions title="Action impossible">
        The action {description && `“${description}”`} failed to execute
        {name && (
          <React.Fragment>
            on <AddressLink to={to}>{name}</AddressLink>
          </React.Fragment>
        )}
        .{' '}
        {error
          ? 'An error occurred when we tried to find a path or send a transaction for this action.'
          : 'You may not have the required permissions.'}
      </Info.Permissions>
      <SignerButton onClick={onClose}>Close</SignerButton>
    </React.Fragment>
  );
}

interface IWeb3ProviderErrorProps {
  actionText?: React.ReactNode;
  intent: IIntent | null;
  neededText?: string;
  onClose(): void;
}

function Web3ProviderError(props: IWeb3ProviderErrorProps) {
  const { intent, onClose, neededText = '', actionText = '' } = props;
  const { description, name, to = '' }: Partial<IIntent> = intent || {};
  return (
    <React.Fragment>
      <Info.Action title="You can't perform any action">
        {neededText} in order to perform{' '}
        {description ? `"${description}"` : 'this action'}
        {name && (
          <React.Fragment>
            on <AddressLink to={to}>{name}</AddressLink>
          </React.Fragment>
        )}
        .<ActionMessage>{actionText}</ActionMessage>
      </Info.Action>
      <SignerButton onClick={onClose}>Close</SignerButton>
    </React.Fragment>
  );
}

const ActionMessage = styled.p`
  margin-top: 15px;
`;

const ButtonLink = styled.button.attrs({ type: 'button' })`
  padding: 0;
  font-size: inherit;
  text-decoration: underline;
  color: ${theme.textPrimary};
  cursor: pointer;
  background: none;
  border: 0;
`;

export default ConfirmTransaction;
