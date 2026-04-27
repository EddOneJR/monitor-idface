import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const EQS_KEY = 'infokings:equipamentos';

const EQS_DEFAULT = [
  { id:1, cliente:"Cores do Rio", equip:"Facial Entrada",  url:"http://187.16.114.155:9701" },
  { id:2, cliente:"Cores do Rio", equip:"Facial Recepção", url:"http://187.16.114.155:9601" },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET /api/check?url=... → ping equipamento
  if (req.method === 'GET' && req.query.url) {
    const { url } = req.query;
    if (!url.startsWith('http://') && !url.startsWith('https://'))
      return res.status(400).json({ online: false, error: 'URL inválida' });
    const t0 = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      await fetch(`${url}/login.html`, {
        method: 'GET', signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' }
      });
      clearTimeout(timer);
      return res.status(200).json({ online: true, ms: Date.now() - t0 });
    } catch (err) {
      return res.status(200).json({ online: false, ms: null,
        error: err.name === 'AbortError' ? 'timeout' : err.message });
    }
  }

  // GET /api/check → listar equipamentos
  if (req.method === 'GET') {
    let eqs = await redis.get(EQS_KEY);
    if (!eqs || eqs.length === 0) {
      eqs = EQS_DEFAULT;
      await redis.set(EQS_KEY, JSON.stringify(eqs));
    }
    if (typeof eqs === 'string') eqs = JSON.parse(eqs);
    return res.status(200).json(eqs);
  }

  // POST /api/check → salvar lista completa
  if (req.method === 'POST') {
    const eqs = req.body;
    if (!Array.isArray(eqs)) return res.status(400).json({ error: 'Formato inválido' });
    await redis.set(EQS_KEY, JSON.stringify(eqs));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
