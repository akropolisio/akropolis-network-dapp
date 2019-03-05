import * as React from 'react';

import { tKeys, i18nConnect, ITranslateProps } from 'services/i18n';
import { StylesProps, provideStyles } from './NotFound.style';

function NotFound(props: ITranslateProps & StylesProps) {
  const { classes, t } = props;
  return (
    <div className={classes.root}>
      <div className={classes.title}>404.</div>
      <div className={classes.description}>{t(tKeys.shared.pageNotFound.getKey())}</div>
    </div>
  );
}

export default i18nConnect(provideStyles(NotFound));
