import { tKeys, TranslateKey } from 'services/i18n';

export function allowedCharactersForCashFlowName(value: string): TranslateKey | undefined {
  const validationRegExp = new RegExp(`^(\\w| )+$`);
  return !validationRegExp.test(value)
    ? tKeys.shared.validation.allowedCharactersForCashFlowName.getKey()
    : undefined;
}
