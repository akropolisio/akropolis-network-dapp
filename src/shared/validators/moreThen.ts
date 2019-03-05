import { tKeys, TranslateKey } from 'services/i18n';

export function moreThen(value: number, currentValue: number): TranslateKey | undefined {
  return currentValue > value ? undefined : {
    key: tKeys.shared.validation.moreThen.getKey(),
    params: { value },
  };
}
