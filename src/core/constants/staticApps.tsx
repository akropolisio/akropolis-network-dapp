import * as React from 'react';
import { HomeOutlinedIcon } from 'shared/view/elements/Icons';
import { IStaticAragonApp } from 'shared/types/models';

export const staticAragonApps = (<T extends Record<string, IStaticAragonApp>>(input: T): T => input)({
  home: {
    icon: <HomeOutlinedIcon />,
    name: 'Home',
    routeKey: 'home',
  },
});
