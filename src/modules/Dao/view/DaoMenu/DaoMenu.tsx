import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { IFrontendAragonApp } from '@aragon/types';

import { staticAragonApps } from 'core/constants';
import routes from 'modules/routes';
import { IStaticAragonApp } from 'shared/types/models';
import { MenuItem, MenuList, ListItemIcon, ListItemText } from 'shared/view/elements';
import { Logo } from 'shared/view/elements/Icons';
import { withComponent } from 'shared/helpers/react';

import { StylesProps, provideStyles } from './DaoMenu.style';

const MenuNavLink = withComponent(NavLink)(MenuItem);

interface IProps {
  apps: IFrontendAragonApp[];
  routeParams: {
    daoName: string;
  };
}

function DaoMenu(props: IProps & StylesProps) {
  const { classes, routeParams, apps } = props;
  const { daoName } = routeParams;

  const items: IStaticAragonApp[] = [
    staticAragonApps.home,
    ...apps.filter(app => app.hasWebApp).map<IStaticAragonApp>(app => ({
      icon: getAppIcon(app),
      name: app.name,
      routeKey: app.proxyAddress,
    })),
  ];

  return (
    <MenuList classes={{ padding: classes.listPadding }}>
      {items.map(item => (
        <MenuNavLink
          key={item.routeKey}
          to={routes.daoName.appAddress.getRedirectPath({ daoName, appAddress: item.routeKey })}
          className={classes.menuItem}
          activeClassName={classes.active}
        >
          <ListItemIcon className={classes.icon}>
            {typeof item.icon === 'string' ? (
              <img src={item.icon} width={24} height={24} />
            ) : item.icon}
          </ListItemIcon>
          <ListItemText classes={{ primary: classes.primary }} inset primary={item.name} />
        </MenuNavLink>
      ))}
    </MenuList>
  );
}

function getAppIcon(app: IFrontendAragonApp): JSX.Element | string {
  const defaultIcon = <Logo />;
  if (!app.icons || !app.icons[0]) { return defaultIcon; }
  return app.baseUrl + app.icons[0].src;
}

export default provideStyles(DaoMenu);
