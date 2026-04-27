# Monitor iDFace Max — InfoKings

Monitor de equipamentos iDFace Max (Control iD) hospedado no Vercel.

## Estrutura
```
monitor-idface/
├── api/
│   └── check.js        ← API proxy (faz ping nos equipamentos)
├── public/
│   └── index.html      ← Frontend do monitor
├── vercel.json         ← Configuração do Vercel
└── package.json
```

## Como funciona
O frontend chama `/api/check?url=http://IP:PORTA` → o servidor Vercel faz o fetch para o equipamento → retorna online/offline. Isso evita bloqueio de Mixed Content (HTTPS → HTTP).
