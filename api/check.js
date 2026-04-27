// api/check.js — Vercel Serverless Function
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://')))
    return res.status(400).json({ online: false, error: 'URL inválida' });

  const t0 = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${url}/login.html`, {
      method: 'GET', signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timer);
    return res.status(200).json({ online: true, ms: Date.now() - t0, status: response.status });
  } catch (err) {
    return res.status(200).json({
      online: false, ms: null,
      error: err.name === 'AbortError' ? 'timeout' : err.message
    });
  }
}
