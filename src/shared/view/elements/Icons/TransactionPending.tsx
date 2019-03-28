import * as React from 'react';
import { GetProps } from '_helpers';

import SvgIcon from '@material-ui/core/SvgIcon';

// tslint:disable:max-line-length
function TransactionPending(props: GetProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 54 35">
      <path d="M2 14.695l15.123 18.439L52 2" stroke="#E5E5E5" strokeWidth="2" fill="none" fillRule="evenodd" strokeLinecap="square" />
    </SvgIcon>
  );
}

export default TransactionPending;
