import { tKeys, TranslateKey } from 'services/i18n';

export function moreThenOrEqual(value: number, currentValue: number): TranslateKey | undefined {
  return currentValue >= value ? undefined : {
    key: tKeys.shared.validation.moreThenOrEqual.getKey(),
    params: { value },
  };
}
