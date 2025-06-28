// src/services/fingerprintService.js
import { decode } from './tokenService.js';

export function validarFingerprint(fingerprint) {
  return typeof fingerprint === 'string' && fingerprint.length >= 16;
}

export function extrairDadosFingerprint(fingerprint) {
  try {
    const payload = decode(fingerprint);

    return {
      nome_razao: payload.nome_razao || 'Novo Cliente',
      telefone: payload.telefone || '',
      sistema_operacional: payload.sistema_operacional || '',
      modelo: payload.modelo || '',
      versao_app: payload.versao_app || '',
      erp_id: payload.erp_id || null,
    };
  } catch {
    return {
      nome_razao: 'Novo Cliente',
      telefone: '',
      sistema_operacional: '',
      modelo: '',
      versao_app: '',
      erp_id: null,
    };
  }
}

// // src/services/fingerprintService.js

// import { decode } from './tokenService.js'; // Assumindo que decode decodifica payload do token JWT/base64

// // Validação simples de fingerprint
// export function validarFingerprint(fingerprint) {
//   return typeof fingerprint === 'string' && fingerprint.length >= 16;
// }

// // Extrai dados do fingerprint
// export function extrairDadosFingerprint(fingerprint) {
//   try {
//     const payload = decode(fingerprint);

//     return {
//       nomerazao: payload.nomerazao || 'Novo Cliente',
//       telefone: payload.telefone || '',
//       sistema: payload.sistema || '',
//       modelo: payload.modelo || '',
//     };
//   } catch (err) {
//     return {
//       nomerazao: 'Novo Cliente',
//       telefone: '',
//       sistema: '',
//       modelo: '',
//     };
//   }
// }
