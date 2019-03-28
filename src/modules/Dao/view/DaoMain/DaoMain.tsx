import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import getEnvParams from 'core/getEnvParams';
import { web3Providers } from 'core/constants';
import { BaseLayout } from 'modules/shared';
import { useDaoWrapper, usePoolNetwork } from 'shared/helpers/react';
import { identifyProvider, getWeb3 } from 'shared/helpers/web3';
import { Preloader } from 'shared/view/elements';

import DaoMenu from '../DaoMenu/DaoMenu';
import DaoContent from '../DaoContent/DaoContent';
import SignerPanel from '../SignerPanel/SignerPanel';
import { StylesProps, provideStyles } from './DaoMain.style';

interface INotification {
  id: string;
  type: string;
  title: string;
  content: string;
}

function DaoMain(props: RouteComponentProps<{ daoName: string, appName: string }> & StylesProps) {
  const { classes, match } = props;
  const daoName = match.params.daoName === 'main' ? getEnvParams().defaultDAOAddress : match.params.daoName;

  const walletWeb3 = React.useMemo(() => getWeb3(web3Providers.wallet), [web3Providers.wallet]);
  const walletProviderId = React.useMemo(() => identifyProvider(web3Providers.wallet), [web3Providers.wallet]);

  const [queuedNotifications, setQueuedNotifications] = React.useState<INotification[]>([]);
  const [notifications, setNotifications] = React.useState<INotification[]>([]);

  const onRequestEnable = React.useCallback(() => {
    const provider = web3Providers.wallet;
    if (!provider) {
      return;
    }
    // For providers supporting .enable() (EIP 1102 draft).
    if (typeof (provider as any).enable === 'function') {
      (provider as any).enable();
      return;
    }
    // For providers supporting EIP 1102 (final).
    if (typeof provider.send === 'function') {
      // Some providers (Metamask) don’t return a promise as defined in EIP
      // 1102, so we can’t rely on it to know the connected accounts.
      (provider as any).send('eth_requestAccounts');
    }
  }, []);

  const daoProps = useDaoWrapper(daoName);
  const poolProps = usePoolNetwork(daoProps.wrapper);

  const { status, apps, wrapper, transactionBag } = daoProps;
  const { account, walletNetwork } = poolProps;

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
      <SignerPanel
        account={account}
        apps={apps}
        daoName={match.params.daoName}
        onRequestEnable={onRequestEnable}
        transactionBag={transactionBag}
        walletNetwork={walletNetwork}
        walletProviderId={walletProviderId}
        walletWeb3={walletWeb3}
        // tslint:disable-next-line:jsx-no-lambda
        onTransactionSuccess={({ data, name, description, identifier }) =>
          setQueuedNotifications([
            {
              id: data,
              type: 'transaction',
              title: `${name} ${identifier}`,
              content: description,
            },
            ...queuedNotifications,
          ])}
        // tslint:disable-next-line:jsx-no-lambda
        onClose={() => queuedNotifications.length && setTimeout(
          () => {
            setNotifications([...queuedNotifications, ...notifications]);
            setQueuedNotifications([]);
          },
          250,
        )}
      />
    </BaseLayout>
  );
}

export default provideStyles(DaoMain);
