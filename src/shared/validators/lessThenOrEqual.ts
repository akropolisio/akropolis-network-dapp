import { tKeys, TranslateKey } from 'services/i18n';

export function lessThenOrEqual(value: number, currentValue: number): TranslateKey | undefined {
  return currentValue <= value ? undefined : {
    key: tKeys.shared.validation.lessThenOrEqual.getKey(),
    params: { value },
  };
}
