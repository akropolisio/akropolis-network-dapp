import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import getEnvParams from 'core/getEnvParams';
import { BaseLayout } from 'modules/shared';
import { useDaoWrapper, usePoolNetwork } from 'shared/helpers/react';
import { GlobalLoader } from 'shared/view/elements';

import DaoMenu from '../DaoMenu/DaoMenu';
import { StylesProps, provideStyles } from './DaoMain.style';

function DaoMain(props: RouteComponentProps<{ daoName: string }> & StylesProps) {
  const { classes, match } = props;
  const daoName = match.params.daoName === 'main' ? getEnvParams().defaultDAOAddress : match.params.daoName;

  const daoProps = useDaoWrapper(daoName);
  const poolProps = usePoolNetwork(daoProps.wrapper);

  const { status, dao, apps } = daoProps;

  return (
    <BaseLayout fullHeight>
      {status === 'loading' && <GlobalLoader />}
      {status === 'error' && 'Something went wrong'}
      {status === 'ready' && (
        <div className={classes.root}>
          <div className={classes.menu}>
            <DaoMenu routeParams={match.params} apps={apps} />
          </div>
          <div className={classes.content}>
            <div className={classes.title}>{status}</div>
            <div className={classes.description}>Address: {dao.address}</div>
            <div className={classes.description}>Domain: {dao.domain}</div>
          </div>
        </div>
      )}
    </BaseLayout>
  );
}

export default provideStyles(DaoMain);
