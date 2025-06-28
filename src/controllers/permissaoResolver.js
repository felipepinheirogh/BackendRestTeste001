// src/controllers/permissaoResolver.js
import { supabaseRequest } from '../supabaseClient.js';

/**
 * Retorna um objeto { chavePermissao: { nivel, valor, descricao } }
 * combinando permissões diretas do usuário + permissões dos grupos vinculados.
 * @param {string} usuario_id
 * @returns {Promise<object>}
 */
export async function getPermissoesEfetivasUsuario(usuario_id) {
  if (!usuario_id) throw new Error('usuario_id ausente');

  // 1) Busca permissões diretas do usuário
  const { data: permissoesUsuario = [] } = await supabaseRequest(
    'GET',
    `permissoes_usuario?usuario_id=eq.${usuario_id}&select=permissoes(*)`
  );

  // 2) Busca grupos do usuário
  const { data: grupos = [] } = await supabaseRequest(
    'GET',
    `grupo_usuario?usuario_id=eq.${usuario_id}&select=grupo_id`
  );
  const gruposIds = grupos.map(g => g.grupo_id);
  if (gruposIds.length === 0) return mapPermissoes(permissoesUsuario);

  // 3) Busca permissões dos grupos
  const { data: permissoesGrupos = [] } = await supabaseRequest(
    'GET',
    `permissoes_grupo?grupo_id=in.(${gruposIds.join(',')})&select=permissoes(*)`
  );

  return consolidarPermissoes(permissoesUsuario, permissoesGrupos);
}

/**
 * Similar para usuarios_revenda
 */
export async function getPermissoesEfetivasUsuarioRevenda(usuario_revenda_id) {
  if (!usuario_revenda_id) throw new Error('usuario_revenda_id ausente');

  const { data: permissoesUsuarioRevenda = [] } = await supabaseRequest(
    'GET',
    `permissoes_usuario_revenda?usuario_revenda_id=eq.${usuario_revenda_id}&select=permissoes(*)`
  );

  const { data: grupos = [] } = await supabaseRequest(
    'GET',
    `grupo_usuario_revenda?usuario_revenda_id=eq.${usuario_revenda_id}&select=grupo_id`
  );
  const gruposIds = grupos.map(g => g.grupo_id);
  if (gruposIds.length === 0) return mapPermissoes(permissoesUsuarioRevenda);

  const { data: permissoesGrupos = [] } = await supabaseRequest(
    'GET',
    `permissoes_grupo?grupo_id=in.(${gruposIds.join(',')})&select=permissoes(*)`
  );

  return consolidarPermissoes(permissoesUsuarioRevenda, permissoesGrupos);
}

/**
 * Mapeia lista de permissão em objeto chave => permissão
 */
function mapPermissoes(permissoes) {
  const mapa = {};
  permissoes.forEach(pu => {
    const p = pu.permissoes;
    mapa[p.chave] = { nivel: p.nivel, valor: p.valor, descricao: p.descricao };
  });
  return mapa;
}

/**
 * Consolida permissões de usuário e grupos, respeitando o maior nível para cada chave
 * @param {Array} permissoesUsuario - permissão direta do usuário
 * @param {Array} permissoesGrupos - permissões dos grupos
 * @returns {Object} mapa consolidado { chave => permissão }
 */
function consolidarPermissoes(permissoesUsuario, permissoesGrupos) {
  const mapa = mapPermissoes(permissoesUsuario);

  permissoesGrupos.forEach(pg => {
    const p = pg.permissoes;
    if (!mapa[p.chave]) {
      mapa[p.chave] = { nivel: p.nivel, valor: p.valor, descricao: p.descricao };
    } else {
      // Mantém o maior nível
      if (p.nivel > mapa[p.chave].nivel) {
        mapa[p.chave] = { nivel: p.nivel, valor: p.valor, descricao: p.descricao };
      }
    }
  });

  return mapa;
}
