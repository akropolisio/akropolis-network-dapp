import * as React from 'react';
import AragonWrapper from '@aragon/wrapper';
import { IFrontendAragonApp } from '@aragon/types';

import { staticAragonApps } from 'core/constants';
import { NotFound } from 'shared/view/components';
import { addressesEqual } from 'shared/helpers/web3';

import AppIFrame, { AppIFrameComponent } from '../AppIFrame/AppIFrame';

interface IProps {
  wrapper: AragonWrapper;
  apps: IFrontendAragonApp[];
  appName: string;
}

function DaoContent(props: IProps) {
  const { apps, wrapper, appName } = props;

  const appIFrame = React.useRef<AppIFrameComponent>(null);
  const handleAppIFrameLoad = React.useCallback((iframe: HTMLIFrameElement) => {
    if (!appIFrame.current || !apps.find(item => addressesEqual(item.proxyAddress, appName))) {
      console.error('The app cannot be connected to aragon.js');
      return;
    }

    wrapper.connectAppIFrame(iframe, appName);
    appIFrame.current && appIFrame.current.sendMessage({
      from: 'wrapper',
      name: 'ready',
      value: true,
    });
  }, [apps, wrapper, appName]);

  const staticApp = staticAragonApps[appName];
  const StaticContent = staticApp && staticApp.content;

  const app = apps.find(item => addressesEqual(item.proxyAddress, appName));

  if (StaticContent) { return <StaticContent />; }

  return app ? (
    <AppIFrame
      app={app}
      innerRef={appIFrame}
      onLoad={handleAppIFrameLoad}
    />
  ) : <NotFound />;
}

export default DaoContent;
