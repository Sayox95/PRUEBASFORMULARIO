// functions/api/guardar.js

export async function onRequestOptions({ request }) {
  const origin = request.headers.get('Origin') || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    }
  });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '*';
  const bodyText = await request.text(); // el body incluye dedupeKey, pdf base64, etc.

  // URL del Apps Script (usa variable de entorno si existe)
  const upstream =
    env?.APPS_SCRIPT_POST_URL ||
    'https://script.google.com/macros/s/AKfycbzvgP22GVS1qTADoa6Ifk5rwOEbd_GStWetQRbVpFtvQduYgW9o1gkSLb9a-6l4v8NIMQ/exec';

  let resp;
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 25000); // timeout 25s
    resp = await fetch(upstream, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyText,
      signal: controller.signal
    });
    clearTimeout(id);
  } catch (e) {
    return new Response(JSON.stringify({
      status: 'ERROR',
      message: 'No se pudo conectar con Apps Script'
    }), {
      status: 502,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'application/json',
        'Vary': 'Origin'
      }
    });
  }

  const text = await resp.text();

  // Reenvía tal cual la respuesta del Apps Script (debe ser JSON)
  return new Response(text, {
    status: resp.status,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Content-Type': 'application/json',
      'Vary': 'Origin'
    }
  });
}
