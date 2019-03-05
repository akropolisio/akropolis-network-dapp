import { withStyles, Theme, WithStyles } from 'shared/styles';
import { rule } from 'shared/helpers/style';

const styles = (_theme: Theme) => ({
  root: rule({
    flexGrow: 1,
    position: 'relative',
  }),

  preloader: rule({
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),

  iframe: rule({
    display: 'block',
    height: '100%',
    width: '100%',
  }),
});

export const provideStyles = withStyles(styles);

export type StylesProps = WithStyles<typeof styles>;
