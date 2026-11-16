const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const session = require('express-session');
const PgSessionStore = require('connect-pg-simple')(session);
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const { rateLimit } = require('express-rate-limit');
const db = require('./db');

const app = express();
const root = __dirname;
const port = Number(process.env.PORT || 3000);
const prod = process.env.NODE_ENV === 'production';
const allowedKeys = ['leads', 'events', 'docs', 'cases', 'campaigns', 'legalLibrary', 'tasks', 'analyses'];
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error('Configure SESSION_SECRET com pelo menos 32 caracteres aleatórios antes de iniciar.');
}
if (prod && !process.env.PUBLIC_ORIGIN) {
  throw new Error('Configure PUBLIC_ORIGIN em produção (por exemplo, https://www.luanacruzadvocacia.com.br).');
}

app.disable('x-powered-by');
if (prod) app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'], imgSrc: ["'self'", 'data:', 'blob:'],
    connectSrc: ["'self'"], objectSrc: ["'none'"], baseUri: ["'self'"], formAction: ["'self'"], frameAncestors: ["'none'"]
  } }
}));
app.use(express.json({ limit: '4mb' }));
const sessionStore = db.usePostgres ? new PgSessionStore({ pool: db.pool, tableName: 'sessions', createTableIfMissing: true }) : undefined;
app.use(session({
  name: 'lc.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: sessionStore,
  cookie: { httpOnly: true, secure: prod, sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000, path: '/' }
}));

function token() { return crypto.randomBytes(32).toString('base64url'); }
function sameToken(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
function originIsAllowed(req) {
  const origin = req.get('origin');
  if (!origin) return false;
  const expected = process.env.PUBLIC_ORIGIN || `${req.protocol}://${req.get('host')}`;
  return origin === expected;
}
function requireCsrf(req, res, next) {
  if (!originIsAllowed(req) || !sameToken(req.get('x-csrf-token'), req.session.csrfToken)) {
    return res.status(403).json({ error: 'Recarregue a página e tente novamente.' });
  }
  next();
}
function requireAuth(req, res, next) {
  if (req.session.userId) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Sessão encerrada.' });
  return res.redirect('/login');
}
function noStore(res) { res.set('Cache-Control', 'no-store, private'); }

const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-8', legacyHeaders: false });
let newsCache = { fetchedAt: 0, items: [] };

app.get('/api/news', requireAuth, async (req, res) => {
  noStore(res);
  if (Date.now() - newsCache.fetchedAt < 5 * 60 * 1000 && newsCache.items.length) return res.json(newsCache);
  try {
    const sources = [
      { host: 'www.cnj.jus.br', name: 'CNJ · Notícias do Judiciário' },
      { host: 'noticias.stf.jus.br', name: 'STF · Notícias' }
    ];
    const cleanText = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/&#8217;|&#8216;|&#039;/g, "'").replace(/&#8220;|&#8221;|&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ').replace(/\s+/g, ' ').trim();
    const results = await Promise.allSettled(sources.map(async source => {
      const url = `https://${source.host}/wp-json/wp/v2/posts?per_page=8&_embed=1&_fields=date,link,title,excerpt,_embedded`;
      const response = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`${source.name} retornou ${response.status}`);
      const posts = await response.json();
      return posts.filter(post => { try { return new URL(post.link).hostname === source.host; } catch { return false; } }).map(post => {
        const media = post._embedded?.['wp:featuredmedia']?.[0];
        let image = '';
        try { const parsed = new URL(media?.source_url || ''); if (parsed.protocol === 'https:' && parsed.hostname === source.host) image = parsed.href; } catch {}
        return { title: cleanText(post.title?.rendered), excerpt: cleanText(post.excerpt?.rendered), date: post.date, link: post.link, image, imageAlt: cleanText(media?.alt_text), source: source.name };
      });
    }));
    const items = results.flatMap(result => result.status === 'fulfilled' ? result.value : [] ).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 14);
    if (!items.length) throw new Error('As fontes oficiais não retornaram notícias no momento.');
    newsCache = { fetchedAt: Date.now(), items };
    res.json(newsCache);
  } catch (err) {
    console.error('Official judiciary news feed unavailable:', err.message);
    if (newsCache.items.length) return res.json({ ...newsCache, stale: true });
    res.status(502).json({ error: 'As fontes oficiais estão temporariamente indisponíveis.' });
  }
});

const BACEN_PRODUCTS = {
  vehicles: { code: 25471, label: 'Aquisição de veículos · pessoa física', unit: '% a.m.' },
  personal: { code: 25464, label: 'Crédito pessoal não consignado · pessoa física', unit: '% a.m.' },
  payroll: { code: 25469, label: 'Crédito pessoal consignado · pessoa física', unit: '% a.m.' },
  card: { code: 25477, label: 'Cartão de crédito rotativo · pessoa física', unit: '% a.m.' },
  overdraft: { code: 25463, label: 'Cheque especial · pessoa física', unit: '% a.m.' }
};
app.get('/api/bacen/rate', requireAuth, async (req, res) => {
  noStore(res);
  const product = BACEN_PRODUCTS[String(req.query.product || '')];
  const period = String(req.query.period || '');
  if (!product || !/^\d{4}-\d{2}$/.test(period) || Number(period.slice(5)) < 1 || Number(period.slice(5)) > 12) return res.status(400).json({ error: 'Informe uma modalidade e mês de contratação válidos.' });
  const [year, month] = period.split('-');
  const from = `01/${month}/${year}`;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const to = `${String(lastDay).padStart(2, '0')}/${month}/${year}`;
  try {
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${product.code}/dados?formato=json&dataInicial=${encodeURIComponent(from)}&dataFinal=${encodeURIComponent(to)}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`BCB retornou ${response.status}`);
    const rows = await response.json();
    if (!Array.isArray(rows) || !rows.length) return res.status(404).json({ error: 'A série BACEN não tem observação publicada para esse mês. Consulte o mês mais próximo ou informe a taxa manualmente.' });
    res.json({ product: product.label, series: product.code, period, date: rows[0].data, rate: Number(String(rows[0].valor).replace(',', '.')), unit: product.unit, source: 'Banco Central do Brasil · SGS' });
  } catch (err) {
    console.error('BCB rate lookup failed:', err.message);
    res.status(502).json({ error: 'Não foi possível consultar o Banco Central agora. Você pode informar manualmente a taxa e a fonte.' });
  }
});

app.get('/health', async (req, res) => {
  try { await db.ready; await db.getState(); res.status(200).json({ status: 'ok' }); }
  catch { res.status(503).json({ status: 'unavailable' }); }
});

app.get('/login', (req, res) => {
  noStore(res);
  if (req.session.userId) return res.redirect('/');
  res.sendFile(path.join(root, 'login.html'));
});
app.get('/login.css', (req, res) => res.sendFile(path.join(root, 'login.css')));
app.get('/login.js', (req, res) => res.sendFile(path.join(root, 'login.js')));
app.use('/assets', express.static(path.join(root, 'assets'), { dotfiles: 'deny', fallthrough: false, maxAge: prod ? '1d' : 0 }));
app.get('/api/csrf', (req, res) => {
  if (!req.session.csrfToken) req.session.csrfToken = token();
  noStore(res);
  res.json({ csrfToken: req.session.csrfToken });
});
app.post('/api/login', loginLimit, requireCsrf, async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    if (username.length > 120 || password.length > 200) return res.status(400).json({ error: 'Usuário ou senha inválidos.' });
    const user = await db.getUser(username);
    const ok = user && await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
    req.session.regenerate(err => {
      if (err) return next(err);
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;
      req.session.csrfToken = token();
      req.session.save(saveError => saveError ? next(saveError) : res.json({ ok: true }));
    });
  } catch (err) { next(err); }
});

app.post('/api/logout', requireAuth, requireCsrf, (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie('lc.sid', { path: '/', httpOnly: true, secure: prod, sameSite: 'strict' });
    res.json({ ok: true });
  });
});

app.use('/api', requireAuth);
app.get('/api/state', async (req, res, next) => {
  noStore(res);
  try {
    const state = await db.getState();
    res.json({ ...state, user: { username: req.session.username, role: req.session.role } });
  } catch (error) { next(error); }
});
app.put('/api/state', requireCsrf, async (req, res, next) => {
  const { version, data } = req.body || {};
  if (!Number.isInteger(version) || !data || typeof data !== 'object' || Array.isArray(data)) return res.status(400).json({ error: 'Dados inválidos.' });
  if (Object.keys(data).some(key => !allowedKeys.includes(key)) || allowedKeys.some(key => !Array.isArray(data[key]))) return res.status(400).json({ error: 'Estrutura de dados inválida.' });
  if (Buffer.byteLength(JSON.stringify(data)) > 4 * 1024 * 1024) return res.status(413).json({ error: 'O conjunto de dados excede o limite.' });
  try {
    const result = await db.saveState(version, data);
    if (!result.saved) return res.status(409).json({ error: 'Outra pessoa salvou alterações. Recarregue para receber a versão mais recente.', version: result.version });
    noStore(res);
    res.json({ version: result.version });
  } catch (error) { next(error); }
});

app.get('/', requireAuth, (req, res) => {
  noStore(res);
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace('data-server-mode="false"', 'data-server-mode="true"');
  res.type('html').send(html);
});
app.use(requireAuth, express.static(root, { dotfiles: 'deny', index: false, maxAge: prod ? '1h' : 0, setHeaders: noStore }));
app.use((err, req, res, next) => {
  console.error('Request failed:', err.message);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Erro interno.' });
});

db.ready.then(() => app.listen(port, '0.0.0.0', () => console.log(`Luana Cruz painel escutando na porta ${port}`))).catch(error => { console.error('Database initialization failed:', error.message); process.exitCode = 1; });
