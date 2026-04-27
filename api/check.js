// api/check.js — Vercel Serverless Function
// Faz a requisição HTTP para o equipamento pelo servidor (evita Mixed Content)

export default async function handler(req, res) {
  // Permite CORS para o frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ online: false, error: 'URL não informada' });
  }

  // Segurança: aceita apenas http:// e URLs com IP/porta
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return res.status(400).json({ online: false, error: 'URL inválida' });
  }

  const t0 = Date.now();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${url}/login.html`, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });

    clearTimeout(timer);
    const ms = Date.now() - t0;

    return res.status(200).json({
      online: true,
      ms,
      status: response.status
    });

  } catch (err) {
    const ms = Date.now() - t0;
    const timedOut = err.name === 'AbortError';

    return res.status(200).json({
      online: false,
      ms: timedOut ? null : ms,
      error: timedOut ? 'timeout' : err.message
    });
  }
}
