// Lógica simples e segura para validar fingerprint

export function validarFingerprint(fingerprint) {
    return typeof fingerprint === 'string' && fingerprint.length >= 16;
  }
  