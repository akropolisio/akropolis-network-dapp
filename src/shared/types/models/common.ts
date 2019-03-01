import { provider } from 'web3-providers';

export type Provider = Exclude<provider, string>;
export type ProviderType =
  'metamask' | 'trust' | 'toshi' | 'cipher' | 'mist' | 'parity' | 'infura' | 'localhost' | 'unknown';

export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type ID = number;
export type UUID = string;
