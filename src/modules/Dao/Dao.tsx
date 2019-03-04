import * as React from 'react';
import { Route, Redirect, RouteComponentProps } from 'react-router-dom';

import routes from 'modules/routes';
import { IModule } from 'shared/types/app';

import DaoMain from './view/DaoMain/DaoMain';

const MarketplaceModule: IModule = {
  getRoutes() {
    return [
      (
        <Route exact key="redirect-to-default-dao-app" path={routes.daoName.getRoutePath()}>
          {({ match: { params: { daoName } } }: RouteComponentProps<{ daoName: string }>) => (
            <Redirect to={routes.daoName.appAddress.getRedirectPath({ daoName, appAddress: 'home' })} />
          )}
        </Route>
      ),
      <Route key="dao" path={routes.daoName.appAddress.getRoutePath()} component={DaoMain} />,
      (
        <Redirect
          key="default-redirect"
          to={routes.daoName.appAddress.getRedirectPath({ daoName: 'main', appAddress: 'home' })}
        />
      ),
    ];
  },
};

export default MarketplaceModule;
