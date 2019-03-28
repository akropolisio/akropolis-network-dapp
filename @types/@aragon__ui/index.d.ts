// tslint:disable:max-classes-per-file
declare module '@aragon/ui' {
  import React from 'react';

  interface ISafeLinkProps {
    href: string;
    style?: React.CSSProperties;
    target?: '_blank';
  }

  export class SafeLink extends React.Component<ISafeLinkProps> { }

  interface IIdentityBadgeProps {
    networkType: string;
    entity: string;
    fontSize: 'small';
  }

  export class IdentityBadge extends React.Component<IIdentityBadgeProps> { }

  interface IButtonProps {
    mode?: string;
    wide?: boolean;
  }

  export class Button extends React.Component<IButtonProps & JSX.IntrinsicElements['button']> { }

  interface ISidePanelProps {
    opened: boolean;
    title: string;
    onClose(): void;
    onTransitionEnd(opened: boolean): void;
  }

  export class SidePanel extends React.Component<ISidePanelProps> { }

  interface IRadioListProps {
    title: string;
    description: string;
    items: Array<{ description: React.ReactNode; title: React.ReactNode }>;
    selected: number;
    onChange(index: number): void;
  }

  export class RadioList extends React.Component<IRadioListProps> { }

  interface IInfoProps {
    title: string;
    icon?: null;
    style?: React.CSSProperties;
  }

  export class Info extends React.Component {
    public static Action: React.ComponentType<IInfoProps>;
    public static Permissions: React.ComponentType<IInfoProps>;
  }

  interface IBlockExplorerUrlOptions {
    networkType?: string;
    provider?: string;
  }
  export function blockExplorerUrl(type: string, value: string, options?: IBlockExplorerUrlOptions): string;

  interface IAragonTheme {
    textSecondary: 'string';
    textPrimary: 'string';
  }

  export const theme: IAragonTheme;
}
