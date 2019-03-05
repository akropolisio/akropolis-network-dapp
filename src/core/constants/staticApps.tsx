import * as React from 'react';
import { HomeOutlinedIcon } from 'shared/view/elements/Icons';
import { IStaticAragonApp, StaticAragonAppType } from 'shared/types/models';

type StaticApps = Record<StaticAragonAppType, IStaticAragonApp> & Record<string, IStaticAragonApp | undefined>;

export const staticAragonApps: StaticApps = {
  home: {
    icon: <HomeOutlinedIcon />,
    content: () => <div>Home App is coming soon</div>,
    name: 'Home',
    routeKey: 'home',
  },
};
