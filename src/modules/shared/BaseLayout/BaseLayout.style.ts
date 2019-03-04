import { withStyles, Theme, WithStyles } from 'shared/styles';
import { rule } from 'shared/helpers/style';

const styles = (theme: Theme) => ({
  content: rule({
    display: 'flex',
    maxWidth: theme.extra.sizes.page.maxWidth,
    flexGrow: 1,
    margin: '0 auto',
  }),
});

export const provideStyles = withStyles(styles);

export type StylesProps = WithStyles<typeof styles>;
