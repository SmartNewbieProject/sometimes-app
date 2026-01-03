import { useLoginRequiredModal } from '../hooks/use-login-required-modal';

export function LoginRequiredModalListener() {
  useLoginRequiredModal();
  return null;
}
