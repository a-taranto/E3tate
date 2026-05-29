// Schedule 4 forbids storing secrets (passwords, PINs, seed phrases, private
// keys) in the register — wills/registers can become public on probate. The
// Vault is the secure store; the register only records WHERE a secret lives.
// This guard rejects secret-like input in register location/notes fields.

const HEX_KEY = /(?:^|[^0-9a-fA-F])(?:0x)?[0-9a-fA-F]{64}(?:[^0-9a-fA-F]|$)/;
// 12–24 whitespace-separated words (BIP-39 mnemonics are 12/15/18/21/24 words).
const MNEMONIC = /^(?:[a-z]+\s+){11,23}[a-z]+$/i;
const BENIGN_LOCATION =
  /(envelope|safe|solicitor|vault|password manager|1password|bitwarden|lastpass|drawer|deposit box|with my)/i;

export interface SecretScan {
  ok: boolean;
  reason?: string;
}

export function scanForSecret(value: string | undefined): SecretScan {
  const v = (value || "").trim();
  if (!v) return { ok: true };
  if (HEX_KEY.test(v)) {
    return { ok: false, reason: "Looks like a private key. Store it in your Vault, not here — record only its location." };
  }
  if (MNEMONIC.test(v)) {
    return { ok: false, reason: "Looks like a recovery phrase. Store it in your Vault, not here — record only its location." };
  }
  // Password-like: mixed case + digit, length >= 8, single token, not a benign
  // "where it's kept" phrase.
  const passwordLike =
    /[a-z]/.test(v) && /[A-Z]/.test(v) && /[0-9]/.test(v) && v.length >= 8 && !/\s/.test(v);
  if (passwordLike && !BENIGN_LOCATION.test(v)) {
    return { ok: false, reason: "Looks like a password. Record only WHERE it's stored, not the value." };
  }
  return { ok: true };
}

export function isSecretLike(value: string | undefined): boolean {
  return !scanForSecret(value).ok;
}
