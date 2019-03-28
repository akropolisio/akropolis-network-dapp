import React from 'react';
import { SafeLink } from '@aragon/ui';
import { NETWORK_CONFIG } from 'core/constants';
import { EtherscanLink } from 'shared/view/components';

interface IProps {
  to: string;
  children?: React.ReactNode;
}

function AddressLink({ children, to }: IProps) {
  return to ? (
    <EtherscanLink address={to} networkType={NETWORK_CONFIG.type}>
      {url =>
        url ? (
          <SafeLink href={url} target="_blank">
            {children || to}
          </SafeLink>
        ) : (
            <>{to}</>
          )
      }
    </EtherscanLink>
  ) : (
      <>an address or app</>
    );
}

export default AddressLink;
