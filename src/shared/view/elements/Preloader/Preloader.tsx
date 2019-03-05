import * as React from 'react';
import * as cn from 'classnames';

import { provideStyles, StylesProps } from './Preloader.style';
import { Logo } from '../Icons';

interface IProps {
  message?: string;
  isGlobal?: boolean;
}

function Preloader(props: IProps & StylesProps) {
  const { classes, message, isGlobal } = props;
  return (
    <div className={cn(classes.root, { [classes.isGlobal]: isGlobal })}>
      <div className={classes.content}>
        <Logo className={classes.logo} />
        <div className={classes.spinner} >
          <div className={classes.circle} />
          <div className={classes.circle} />
          <div className={classes.circle} />
        </div>
        {message && <div className={classes.message}>{message}</div>}
      </div>
    </div>
  );
}

export default provideStyles(Preloader);
