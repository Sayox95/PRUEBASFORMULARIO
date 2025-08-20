// functions/api/guardar.js

export async function onRequestOptions({ request }) {
  const origin = request.headers.get('Origin') || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin') || '*';
  const bodyText = await request.text();

  // Usa variable de entorno si quieres (Settings > Environment variables)
  const upstream =
    env.APPS_SCRIPT_POST_URL ||
    "https://script.google.com/macros/s/AKfycbzvgP22GVS1qTADoa6Ifk5rwOEbd_GStWetQRbVpFtvQduYgW9o1gkSLb9a-6l4v8NIMQ/exec";

  let resp;
  try {
    resp = await fetch(upstream, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyText
    });
  } catch (e) {
    return new Response(JSON.stringify({
      status: 'ERROR',
      message: 'No se pudo conectar con Apps Script'
    }), {
      status: 502,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Content-Type': 'application/json'
      }
    });
  }

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Content-Type': 'application/json'
    }
  });
}
