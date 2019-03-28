import { blockExplorerUrl } from '@aragon/ui';
import { ReactElement } from 'react';

interface IProps {
  address: string;
  networkType: string;
  children(url: string): ReactElement<any>;
}

// Render props component that injects an appropriate Etherscan url if possible
function EtherscanLink({ address, children, networkType }: IProps) {
  const etherscanUrl = blockExplorerUrl('address', address, {
    networkType,
  });
  return children(etherscanUrl);
}

export default EtherscanLink;
