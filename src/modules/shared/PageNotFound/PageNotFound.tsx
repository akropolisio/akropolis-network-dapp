import * as React from 'react';

import { InjectedAuthRouterProps } from 'shared/helpers/authWrapper';
import { NotFound } from 'shared/view/components';

import BaseLayout from '../BaseLayout/BaseLayout';

type IProps = InjectedAuthRouterProps;

function PageNotFound(_props: IProps) {
  return (
    <BaseLayout fullHeight>
      <NotFound />
    </BaseLayout>
  );
}

export { IProps };
export default PageNotFound;
