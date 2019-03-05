import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import getEnvParams from 'core/getEnvParams';
import { BaseLayout } from 'modules/shared';
import { useDaoWrapper, usePoolNetwork } from 'shared/helpers/react';
import { Preloader } from 'shared/view/elements';

import DaoMenu from '../DaoMenu/DaoMenu';
import DaoContent from '../DaoContent/DaoContent';
import { StylesProps, provideStyles } from './DaoMain.style';

function DaoMain(props: RouteComponentProps<{ daoName: string, appName: string }> & StylesProps) {
  const { classes, match } = props;
  const daoName = match.params.daoName === 'main' ? getEnvParams().defaultDAOAddress : match.params.daoName;

  const daoProps = useDaoWrapper(daoName);
  const poolProps = usePoolNetwork(daoProps.wrapper);

  const { status, apps, wrapper } = daoProps;

  return (
    <BaseLayout fullHeight>
      {status === 'loading' && <Preloader />}
      {status === 'error' && 'Something went wrong'}
      {status === 'ready' && wrapper && (
        <div className={classes.root}>
          <div className={classes.menu}>
            <DaoMenu routeParams={match.params} apps={apps} />
          </div>
          <div className={classes.content}>
            <DaoContent appName={match.params.appName} apps={apps} wrapper={wrapper} />
          </div>
        </div>
      )}
    </BaseLayout>
  );
}

export default provideStyles(DaoMain);
