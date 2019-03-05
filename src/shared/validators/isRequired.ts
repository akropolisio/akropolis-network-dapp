import { tKeys, TranslateKey } from 'services/i18n';

export function isRequired(value: any): TranslateKey | undefined {
  return !value ? tKeys.shared.validation.isRequired.getKey() : undefined;
}
