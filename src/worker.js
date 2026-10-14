// Worker: sirve la web estática (binding ASSETS) y la API del panel de administración.
// GET  /api/config  -> datos editables (204 si aún no se ha guardado nada)
// POST /api/config  -> guarda datos; exige cabecera Authorization: Bearer <ADMIN_PASSWORD>
const KEY = 'config';
const MAX = 120;

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  });

function clean(input) {
  const str = (v, max = MAX) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const h = input && typeof input.horario === 'object' && input.horario ? input.horario : {};
  const out = {
    telefono: str(input.telefono, 30),
    correo: str(input.correo, 100),
    direccion: str(input.direccion),
    ciudad: str(input.ciudad),
    horario: { semana: str(h.semana), sabado: str(h.sabado), domingo: str(h.domingo) },
  };
  if (!out.telefono || !out.direccion || !out.ciudad || !out.horario.semana || !out.horario.sabado || !out.horario.domingo) {
    return { error: 'Rellena teléfono, dirección, ciudad y los tres horarios.' };
  }
  if (!/^[+\d][\d\s.-]{5,}$/.test(out.telefono)) return { error: 'El teléfono no es válido.' };
  if (out.correo && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(out.correo)) return { error: 'El correo no es válido.' };
  return { value: out };
}

async function verify(token, env) {
  const enc = new TextEncoder();
  if (env.ADMIN_HASH && env.ADMIN_SALT) {
    const key = await crypto.subtle.importKey('raw', enc.encode(token), 'PBKDF2', false, ['deriveBits']);
    const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(env.ADMIN_SALT), iterations: 100000 }, key, 256));
    const got = Array.from(bits, (b) => b.toString(16).padStart(2, '0')).join('');
    return same(got, env.ADMIN_HASH);
  }
  return env.ADMIN_PASSWORD ? same(token, env.ADMIN_PASSWORD) : false;
}

async function same(a, b) {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]);
  const xa = new Uint8Array(x), ya = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < xa.length; i++) diff |= xa[i] ^ ya[i];
  return diff === 0;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/config') return env.ASSETS.fetch(request);

    if (request.method === 'GET') {
      const stored = env.CONFIG ? await env.CONFIG.get(KEY) : null;
      if (!stored) return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
      return new Response(stored, { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-cache' } });
    }

    if (request.method === 'POST') {
      if (!env.ADMIN_PASSWORD && !env.ADMIN_HASH) return json({ error: 'Panel sin configurar: falta el secreto ADMIN_PASSWORD.' }, 503);
      if (!env.CONFIG) return json({ error: 'Panel sin configurar: falta el KV CONFIG.' }, 503);
      const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
      if (!(await verify(token, env))) {
        await new Promise((r) => setTimeout(r, 800));
        return json({ error: 'Contraseña incorrecta.' }, 401);
      }
      let body;
      try { body = await request.json(); } catch { return json({ error: 'Datos no válidos.' }, 400); }
      const res = clean(body || {});
      if (res.error) return json({ error: res.error }, 400);
      await env.CONFIG.put(KEY, JSON.stringify(res.value));
      return json({ ok: true });
    }

    return json({ error: 'Método no permitido.' }, 405, { allow: 'GET, POST' });
  },
};
