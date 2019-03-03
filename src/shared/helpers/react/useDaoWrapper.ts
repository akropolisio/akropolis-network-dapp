import { useState, useEffect } from 'react';
import AragonWrapper from '@aragon/wrapper';
import { IFrontendAragonApp, IAragonPermissions, ITransactionBag, IAragonApp } from '@aragon/types';
import initWrapper from '../aragon-wrapper';

type WrapperInitializationStatus = 'loading' | 'ready' | 'error';

interface InjectProps {
  wrapper: AragonWrapper | null;
  status: WrapperInitializationStatus;
  dao: {
    address: string;
    domain: string;
  };
  apps: IFrontendAragonApp[];
  permissions: IAragonPermissions;
  transactionBag: ITransactionBag | null;
  forwarders: IAragonApp[];
}

const initialProps: InjectProps = {
  wrapper: null,
  status: 'loading',
  dao: { address: '', domain: '' },
  apps: [],
  permissions: {},
  transactionBag: null,
  forwarders: [],
};

export default function useDaoWrapper(daoAddressOrDomain: string): InjectProps {
  const [status, setStatus] = useState(initialProps.status);
  const [wrapper, setWrapper] = useState(initialProps.wrapper);
  const [dao, setDao] = useState(initialProps.dao);
  const [apps, setApps] = useState(initialProps.apps);
  const [permissions, setPermissions] = useState(initialProps.permissions);
  const [transactionBag, setTransactionBag] = useState(initialProps.transactionBag);
  const [forwarders, setForwarders] = useState(initialProps.forwarders);

  useEffect(() => {
    resetState();
    init();
  }, [daoAddressOrDomain]);

  return { status, wrapper, dao, apps, permissions, transactionBag, forwarders };

  function resetState() {
    setStatus(initialProps.status);
    setWrapper(initialProps.wrapper);
    setDao(initialProps.dao);
    setApps(initialProps.apps);
    setPermissions(initialProps.permissions);
    setTransactionBag(initialProps.transactionBag);
    setForwarders(initialProps.forwarders);
  }

  async function init() {
    const nextWrapper = await initWrapper(daoAddressOrDomain, {
      onError: err => {
        console.log(`Wrapper init, recoverable error: ${err.name}. ${err.message}.`);
        setStatus('error');
      },
      onDaoAddress: (nextDao) => {
        console.log('dao address', nextDao.address);
        console.log('dao domain', nextDao.domain);
        setDao(nextDao);
      },
      onApps: nextApps => {
        console.log('apps updated', nextApps);
        setApps(nextApps);
        setStatus('ready');
      },
      onPermissions: nextPermissions => {
        console.log('permissions updated', nextPermissions);
        setPermissions(nextPermissions);
      },
      onForwarders: nextForwarders => {
        console.log('forwarders', nextForwarders);
        setForwarders(nextForwarders);
      },
      onTransactionBag: nextTransactionBag => {
        console.log('transaction bag', nextTransactionBag);
        setTransactionBag(nextTransactionBag);
      },
    });
    setWrapper(nextWrapper);
  }
}
