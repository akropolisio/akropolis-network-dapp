import { isEthereumAddress } from './isEthereumAddress';
import { TranslateKey, tKeys } from 'services/i18n';

function validate(value: string): TranslateKey | undefined {
  return isEthereumAddress(value) ? undefined : tKeys.shared.validation.invalidWalletAddress.getKey();
}

export { validate as isEthereumAddress };
