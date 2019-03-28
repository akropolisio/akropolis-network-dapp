import React from 'react';
import { bind } from 'decko';
import styled from 'styled-components';
import { ITransaction } from '@aragon/types';
import { Info, RadioList, SafeLink, IdentityBadge } from '@aragon/ui';

import { NETWORK_CONFIG } from 'core/constants';
import getProviderString from 'shared/helpers/providerStrings';

import SignerButton from './SignerButton';
import AddressLink from './AddressLink';
import { IIntent } from './types';

const RADIO_ITEM_TITLE_LENGTH = 30;

interface IProps {
  direct: boolean;
  intent: IIntent;
  daoName: string;
  paths: ITransaction[][];
  pretransaction: ITransaction | null;
  signingEnabled: boolean;
  walletProviderId: string;
  onSign(transaction: ITransaction, intent: IIntent, pretransaction: ITransaction | null): void;
}

interface IState {
  selected: number;
}

class ActionPathsContent extends React.Component<IProps, IState> {
  public state: IState = {
    selected: 0,
  };

  public render() {
    const {
      intent,
      direct,
      paths,
      pretransaction,
      signingEnabled,
      walletProviderId,
    } = this.props;
    const { selected } = this.state;
    const showPaths = !direct;
    const radioItems = paths.map(this.getPathRadioItem);
    return (
      <React.Fragment>
        {showPaths ? (
          <ActionContainer>
            <Info.Permissions title="Permission note:">
              You cannot directly perform this action. You do not have the
              necessary permissions.
            </Info.Permissions>
            <Actions>
              <RadioList
                title="Action Requirement"
                description={
                  paths.length > 1
                    ? 'Here are some options you can use to perform it:'
                    : 'You can perform this action through:'
                }
                items={radioItems}
                onChange={this.handleChange}
                selected={selected}
              />
            </Actions>
          </ActionContainer>
        ) : (
            <DirectActionHeader>
              You can directly perform this action:
            </DirectActionHeader>
          )
        }
        <Info.Action icon={null} title="Action to be triggered">
          {this.renderDescription(showPaths, intent)}
        </Info.Action>
        {pretransaction && (
          <Info.Action
            title="Two transactions required"
            style={{ marginTop: '20px' }}
          >
            This action requires two transactions to be signed in{' '}
            {getProviderString('your Ethereum provider', walletProviderId)}, please
            confirm them one after another.
          </Info.Action>
        )}
        <SignerButton onClick={this.handleSign} disabled={!signingEnabled}>
          Create transaction
        </SignerButton>
      </React.Fragment>
    );
  }

  private renderDescription(
    showPaths: boolean,
    { description, name, to, annotatedDescription }: IIntent,
  ) {
    return (
      <React.Fragment>
        <p>This transaction will {showPaths && 'eventually'} perform</p>
        <div style={{ margin: '10px 0 10px 15px' }}>
          {annotatedDescription
            ? annotatedDescription.map((desc, index) => {
              if (desc.type === 'address') {
                return (
                  <span
                    key={index}
                    style={{
                      display: 'inline-flex',
                      verticalAlign: 'middle',
                      marginRight: 4,
                    }}
                  >
                    <IdentityBadge networkType={NETWORK_CONFIG.type} entity={desc.value} fontSize="small" />
                  </span>
                );
              } else if (desc.type === 'app') {
                return (
                  <SafeLink
                    key={index}
                    href={`/#/${
                      this.props.daoName
                      }/permissions/?params=app.${desc.value.proxyAddress}`}
                    target="_blank"
                    style={{ marginRight: '2px' }}
                  >
                    {desc.value.name}
                  </SafeLink>
                );
              } else if (desc.type === 'role') {
                return (
                  <span
                    key={index}
                    style={{ marginRight: '4px', fontStyle: 'italic' }}
                  >
                    {desc.value.name}
                  </span>
                );
              } else if (desc.type === 'text') {
                return (
                  <span key={index} style={{ marginRight: '4px' }}>
                    {desc.value}
                  </span>
                );
              }
            })
            : description || 'an action'}
        </div>
        <p>
          {' on '}
          <AddressLink to={to}>{name}</AddressLink>.
        </p>
      </React.Fragment>
    );
  }

  private getPathRadioItem(path: ITransaction[]) {
    // Slice off the intention (last transaction in the path)
    path = path.slice(0, path.length - 1);

    const titleElements = path.reduce<React.ReactChild[]>((acc, { name }, index) => {
      const shortName =
        name.length > RADIO_ITEM_TITLE_LENGTH
          ? name.slice(0, RADIO_ITEM_TITLE_LENGTH) + '…'
          : name;

      if (acc.length) {
        acc.push(' → ');
      }
      acc.push(
        <span key={index} title={name}>
          {shortName}
        </span>,
      );
      return acc;
    }, []);

    const descriptionElements =
      path.length === 1
        ? path[0].description
        : path.map(({ name, description }, index) => (
          <p key={index}>
            {index + 1}. {name}: {description}
          </p>
        ));

    return {
      description: <React.Fragment>{descriptionElements}</React.Fragment>,
      title: <React.Fragment>{titleElements}</React.Fragment>,
    };
  }

  @bind
  private handleChange(selected: number) {
    this.setState({ selected });
  }

  @bind
  private handleSign() {
    const { intent, direct, paths, pretransaction, onSign } = this.props;
    const { selected } = this.state;
    // In non-direct paths, the first transaction (0) is the one we need to sign
    // to kick off the forwarding path
    onSign(
      direct ? intent.transaction : paths[selected][0],
      intent,
      pretransaction,
    );
  }
}

const ActionContainer = styled.div`
  margin-bottom: 40px;
`;

const Actions = styled.div`
  margin-top: 25px;
`;

const DirectActionHeader = styled.h2`
  margin-bottom: 10px;
`;

export default ActionPathsContent;
