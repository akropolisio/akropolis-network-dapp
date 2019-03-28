import * as React from 'react';
import { Button } from '@aragon/ui';
import { GetProps, Omit } from '_helpers';

function SignerButton(props: Omit<GetProps<typeof Button>, 'ref'>) {
  return (
    <Button mode="strong" wide style={{ marginTop: 20 }} {...props} />
  );
}

export default SignerButton;
