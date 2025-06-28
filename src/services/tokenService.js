// src/services/tokenService.js
import { lerToken } from './cryptoService.js';

export function decode(token) {
  const jsonString = lerToken(token);
  try {
    return JSON.parse(jsonString);
  } catch {
    return {};
  }
}

export { gerarToken, lerToken } from './cryptoService.js';
