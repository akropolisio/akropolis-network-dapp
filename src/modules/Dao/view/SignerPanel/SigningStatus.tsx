import React from 'react';
import styled from 'styled-components';
import { Info, theme } from '@aragon/ui';

import { TransactionError, TransactionPending, TransactionSuccess } from 'shared/view/elements/Icons';
import getProviderString from 'shared/helpers/providerStrings';
import SignerButton from './SignerButton';

// Temporarily clean the error messages coming from Aragon.js and Metamask
const cleanErrorMessage = (msg: string) => msg.replace(/^Returned error: /, '').replace(/^Error: /, '');

interface IProps {
  status: 'signing' | 'signed' | 'error';
  signError: any;
  walletProviderId: string;
  onClose(): void;
}

const iconsByStatus: Record<IProps['status'], JSX.Element> = {
  error: <TransactionError />,
  signed: <TransactionSuccess />,
  signing: <TransactionPending />,
};

class SigningStatus extends React.Component<IProps> {
  public getLabel() {
    const { status } = this.props;
    if (status === 'signing') { return 'Waiting for signature…'; }
    if (status === 'signed') { return 'Transaction signed!'; }
    if (status === 'error') { return 'Error signing the transaction'; }
  }
  public getInfo() {
    const { status, signError, walletProviderId } = this.props;
    if (status === 'signing') {
      return (
        <p>
          Open {getProviderString('your Ethereum provider', walletProviderId)} to
          sign your transaction.
        </p>
      );
    }
    if (status === 'signed') {
      return (
        <p>
          Success! Your transaction has been sent to the network for processing.
        </p>
      );
    }
    if (status === 'error') {
      return (
        <React.Fragment>
          <p>
            Woops, something went wrong. The transaction hasn’t been signed and
            no tokens have been sent.
          </p>
          {signError && <p>Error: “{cleanErrorMessage(signError.message)}”</p>}
        </React.Fragment>
      );
    }
  }
  public getCloseButton() {
    const { status, onClose } = this.props;
    if (status === 'error' || status === 'signed') {
      return <SignerButton onClick={onClose}>Close</SignerButton>;
    }
    return null;
  }
  public render() {
    const { status } = this.props;
    return (
      <React.Fragment>
        <Status>
          <StatusImageMain>
            {iconsByStatus[status]}
          </StatusImageMain>
          <p>{this.getLabel()}</p>
        </Status>
        <AdditionalInfo>{this.getInfo()}</AdditionalInfo>
        {this.getCloseButton()}
      </React.Fragment>
    );
  }
}

const Status = styled.div`
  margin-top: 80px;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${theme.textSecondary};
  img {
    margin-bottom: 20px;
  }
`;

const AdditionalInfo = styled(Info)`
  p + p {
    margin-top: 10px;
  }
`;

const StatusImageMain = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default SigningStatus;
