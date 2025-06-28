const crypto = require('crypto');
const zlib = require('zlib');

const SECRET_KEY = 'ChaveUltraSecretaDeGestao360';

function getXORKey() {
  return crypto.createHash('sha256').update(SECRET_KEY).digest();
}

function xorBytes(data, key) {
  const output = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    output[i] = data[i] ^ key[i % key.length];
  }
  return output;
}

function gerarToken(dadosTexto) {
  const compactado = zlib.deflateSync(Buffer.from(dadosTexto, 'utf-8'));
  const chave = getXORKey();
  const criptografado = xorBytes(compactado, chave);
  return criptografado.toString('base64url');
}

function lerToken(token) {
  try {
    const criptografado = Buffer.from(token, 'base64url');
    const chave = getXORKey();
    const compactado = xorBytes(criptografado, chave);
    const descompactado = zlib.inflateSync(compactado);
    return descompactado.toString('utf-8');
  } catch (error) {
    return 'Token inválido';
  }
}

module.exports = {
  gerarToken,
  lerToken
};
