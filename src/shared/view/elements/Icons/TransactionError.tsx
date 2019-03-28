import * as React from 'react';
import { GetProps } from '_helpers';

import SvgIcon from '@material-ui/core/SvgIcon';

// tslint:disable:max-line-length
function TransactionError(props: GetProps<typeof SvgIcon>) {
  return (
    <SvgIcon {...props} viewBox="0 0 31 30">
      <g stroke="#FB778E" strokeWidth="2" fill="none" fillRule="evenodd" strokeLinecap="square">
        <path d="M28.5 1.5L2.024 27.976M2.5 1.5l26.476 26.476" />
      </g>
    </SvgIcon>
  );
}

export default TransactionError;
