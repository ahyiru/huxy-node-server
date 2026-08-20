import {urlencoded as F, Router as N} from 'express';
import O from 'express-session';
var _ = 1440 * 60 * 1e3,
  x = ({cookie: t, maxAge: e, ...r} = {}) =>
    O({
      secret: '',
      resave: !1,
      saveUninitialized: !1,
      cookie: {httpOnly: !0, sameSite: 'lax', maxAge: (Number(e) || 30) * _, ...t},
      ...r,
    }),
  w = t => (e, r, s) =>
    e.session?.authorized ? s()
    : e.accepts(['html', 'json']) === 'json' ? r.status(401).json({error: '\u672A\u6388\u6743', redirect: `${t}/email`})
    : r.redirect(`${t}/email`),
  v =
    (t = '_flash') =>
    (e, r, s) => {
      if (!e.session)
        return s(new Error('flashMiddleware: express-session is required and must be mounted before flash'));
      ((e.session[t] = e.session[t] || {}),
        (e.flash = (i, m) => {
          if (i === void 0) {
            let n = e.session[t];
            return ((e.session[t] = {}), n);
          }
          if (m === void 0) {
            let n = e.session[t][i];
            return (delete e.session[t][i], n ?? '');
          }
          e.session[t][i] = m;
        }),
        s());
    };
var y =
    ({mailCfg: t, codeCfg: e} = {}) =>
    async ({email: r, code: s, ...i}) => {
      let {from: m, subject: n, ...p} = t ?? {},
        l = (await import('nodemailer')).default.createTransport(p),
        {ttl: o} = e ?? {};
      await l.sendMail({
        from: m,
        to: r,
        subject: n,
        text: `\u60A8\u7684\u9A8C\u8BC1\u7801\u662F ${s}\uFF0C\u6709\u6548\u671F ${Math.floor(o / 6e4)} \u5206\u949F\u3002\u5982\u975E\u672C\u4EBA\u64CD\u4F5C\u8BF7\u5FFD\u7565\u3002`,
        html: `<p>\u60A8\u7684\u9A8C\u8BC1\u7801\u662F <b>${s}</b>\uFF0C\u6709\u6548\u671F ${Math.floor(o / 6e4)} \u5206\u949F\u3002</p>`,
        ...i,
      });
    },
  E = ({CODE_LENGTH: t = 6} = {}) => String(Math.floor(Math.random() * 10 ** t)).padStart(t, '0');
var M = t => {
  let e = new Map();
  return {
    set: (r, s) => {
      e.set(r.toLowerCase(), {code: s, expiresAt: Date.now() + t.ttl, attempts: 0});
    },
    get: r => e.get(r.toLowerCase()),
    delete: r => e.delete(r.toLowerCase()),
    isExpired: r => !r || r.expiresAt < Date.now(),
  };
};
var h = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 606" width="100%" height="100%" aria-label="Ihuxy" role="img">
<defs>
  <clipPath id="c1"><polygon points="340.53 92.23 236.41 71.11 203.17 127.64 345.23 100.22 340.53 92.23"/></clipPath>
  <clipPath id="c2"><path d="M288.35 3.51a7 7 0 0 0-12.17 0L246.84 53.38l80.44 16.31Z"/></clipPath>
  <clipPath id="c3" transform="translate(0 158.55)"><polygon points="410.82 218.81 412.96 215.38 363.84 131.85 179.8 167.37 174.96 175.6 410.82 218.81"/></clipPath>
  <radialGradient id="g" cx="280.81" cy="176" r="176" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#fff" stop-opacity=".6"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
</defs>
<g>
  <polygon fill="#4dc8fa" points="203.17 286.19 345.23 258.77 340.53 250.78 236.41 229.67 203.17 286.19"/>
  <polygon fill="#4dc8fa" points="363.84 290.41 179.8 325.93 174.96 334.15 415.48 378.21 363.84 290.41"/>
  <path fill="#00b2f0" d="M445.91 271.39 150.45 217.26l-40.06 68.12a7.2 7.2 0 0 0 6.08 10.89H448.06a7.2 7.2 0 0 0 6.08-10.89Z" transform="translate(0 158.55)"/>
  <path fill="#4dc8fa" d="M327.28 69.69 288.35 3.51a7 7 0 0 0-12.17 0L246.84 53.38Z" transform="translate(0 158.55)"/>
  <path fill="#acd038" d="M245.05 296.27H7.53c-6.06 0-9.63-7.52-6.18-13l51.74-82.68 97.09 17.12 68 12 33 53.62C254.64 288.81 251.07 296.27 245.05 296.27Z" transform="translate(0 158.55)"/>
  <path fill="#acd038" d="M133.41 92.05A7.12 7.12 0 0 0 121 92L81 156l79.87-19.37Z" transform="translate(0 158.55)"/>
  <path fill="#026fb4" d="M410.82 218.81l97.3 15.48-48.27-78.35a5.56 5.56 0 0 0-9.67 0l-39.36 62.91Z" transform="translate(0 158.55)"/>
  <path fill="#006eb3" d="M535.23 296.27H373.53c-4.73 0-7.51-5.86-4.83-10.17l16.13-25.75 60.86 9.25 92.92 14.16 1.47 2.39C542.72 290.43 539.93 296.27 535.23 296.27Z" transform="translate(0 158.55)"/>
  <path fill="#01656f" d="M460.43 296.27h-86.9c-4.73 0-7.51-5.86-4.83-10.17l16.13-25.75 60.86 9.25Z" transform="translate(0 158.55)"/>
  <path fill="#009698" d="M245.05 296.27H101.43l48.75-78.58 68 12 33 53.62C254.64 288.81 251.07 296.27 245.05 296.27Z" transform="translate(0 158.55)"/>
  <g clip-path="url(#c3)"><circle fill="url(#g)" cx="280.81" cy="176" r="176"/></g>
</g>
</svg>`;
var $ = `
:root {
  --cf: #f6821f;
  --cf-hover: #e07317;
  --cf-ring: rgba(246,130,31,.15);
  --g50: #f8f9fa; --g200: #e9ecef; --g300: #dee2e6;
  --g500: #adb5bd; --g600: #6c757d; --g900: #212529;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font:15px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--g50);color:var(--g900);min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:1rem}
.card{background:#fff;border:1px solid var(--g200);border-radius:12px;padding-block-start:clamp(1rem,3vw,1.5rem);padding-block-end:clamp(1.5rem,5vw,2.5rem);padding-inline:clamp(1.5rem,5vw,2.5rem);width:100%;max-width:380px;box-shadow:0 1px 3px rgba(0,0,0,.05),0 4px 16px rgba(0,0,0,.04)}
.logo{width:44px;height:54px;margin:0 auto;display:grid;place-items:center}
.logo svg{width:100%;height:100%}
h1{font-size:1.125rem;font-weight:600;text-align:center}
.team{text-align:center;color:var(--g600);font-size:.8125rem;margin-top:.125rem}
.desc{text-align:center;color:var(--g500);font-size:.8125rem;margin:.875rem 0 1.5rem;line-height:1.5}
.input{width:100%;padding:.6875rem .875rem;border:1px solid var(--g300);border-radius:6px;font-size:.9375rem;color:var(--g900);background:#fff;transition:border-color .15s,box-shadow .15s}
.input:focus{outline:none;border-color:var(--cf);box-shadow:0 0 0 3px var(--cf-ring)}
.btn{width:100%;padding:.6875rem;margin-top:1rem;background:var(--cf);color:#fff;border:0;border-radius:6px;font-size:.9375rem;font-weight:500;cursor:pointer;transition:background .15s;position:relative;display:flex;align-items:center;justify-content:center;min-height:42px}
.btn:hover{background:var(--cf-hover)}
.btn:focus-visible{outline:2px solid var(--cf);outline-offset:2px}
.btn.loading{color:transparent;pointer-events:none}
.btn.loading::after{content:"";position:absolute;width:1.1rem;height:1.1rem;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin .6s linear infinite;color:#fff}
@keyframes spin{to{transform:rotate(360deg)}}
button[disabled],a[disabled]{cursor: not-allowed;opacity: 0.7}
.footer{text-align:center;margin-top:2rem;font-size:.6875rem;color:var(--g500)}
.err{background:#fef3cd;border:1px solid #ffc107;color:#856404;padding:.5625rem .75rem;border-radius:6px;font-size:.8125rem;margin-bottom:1rem}
.links{display:flex;justify-content:space-between;margin-top:1rem}
.links a{color:var(--cf);font-size:.8125rem;text-decoration:none}
.links a:hover{text-decoration:underline}
.code-input{width:100%;padding:.5rem .75rem;text-align:center;font-size:1.5rem;letter-spacing:.6rem;border:1px solid var(--g300);border-radius:6px;transition:border-color .15s,box-shadow .15s}
.code-input:focus{outline:none;border-color:var(--cf);box-shadow:0 0 0 3px var(--cf-ring)}
`,
  A = (t, {title: e, tips: r, footer: s, logo: i} = {}, m) => (
    (i =
      i ?
        i.startsWith('https://') || i.startsWith('http://') ?
          `<img src="${i}" alt="logo" />`
        : i
      : h),
    `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>\u9A8C\u8BC1\u90AE\u7BB1</title><style>${$}</style></head><body>
<div class="card">
  <div class="logo">${i}</div>
  <p class="team">${e ?? ''}</p>
  <p class="desc">${r ?? ''}</p>
  ${t ? `<div class="err">${t}</div>` : ''}
  <form method="post" action="${m}/email" id="emailForm">
    <input class="input" type="email" name="email" placeholder="name@ihuxy.com" required autofocus autocomplete="email">
    <button class="btn" type="submit" id="submitBtn">Send code</button>
  </form>
  <p class="footer">${s ?? ''}</p>
</div>
<script>
document.getElementById('emailForm').addEventListener('submit', function() {
  var btn = document.getElementById('submitBtn');
  btn.classList.add('loading');
  btn.disabled = true;
});
</script>
</body></html>`
  ),
  S = (t, e, {logo: r} = {}, s, {ttl: i = 3e5} = {}) => (
    (r =
      r ?
        r.startsWith('https://') || r.startsWith('http://') ?
          `<img src="${r}" alt="logo" />`
        : r
      : h),
    `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>\u9A8C\u8BC1\u7801</title><style>${$}</style></head><body>
<div class="card">
  <div class="logo">${r}</div>
  <p class="team">\u5DF2\u5411 <strong style="color:var(--g900)">${t}</strong> \u53D1\u9001\u4E86\u9A8C\u8BC1\u7801</p>
  <p class="desc">\u6709\u6548\u671F <strong style="color:var(--cf)">${Math.floor(i / 6e4)}</strong> \u5206\u949F</p>
  ${e ? `<div class="err">${e}</div>` : ''}
  <form method="post" action="${s}/code" id="codeForm">
    <input class="code-input" type="text" name="code" inputmode="numeric" pattern="[0-9]*" maxlength="6" required autofocus autocomplete="one-time-code">
    <button class="btn" type="submit" id="verifyBtn">\u9A8C\u8BC1</button>
  </form>
  <div class="links">
    <a href="${s}/email" id="a1">\u66F4\u6539\u90AE\u7BB1</a>
    <a href="${s}/email" id="a2">\u91CD\u65B0\u53D1\u9001</a>
  </div>
</div>
<script>
document.getElementById('codeForm').addEventListener('submit', function() {
  var btn = document.getElementById('verifyBtn');
  btn.classList.add('loading');
  btn.disabled = true;
  var a1 = document.getElementById('a1');
  var a2 = document.getElementById('a2');
  a1.disabled = true;
  a2.disabled = true;
});
</script>
</body></html>`
  );
var B = /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  T =
    t =>
    (e, r, s, i = 'email') => {
      (e.flash('error', s), r.redirect(`${t}/${i}`));
    },
  L = ({code: t, mail: e, allowedEmails: r, page: s, authpath: i} = {}, m) => {
    let n = m(),
      p = M(t),
      g = y({mailCfg: e, codeCfg: t}),
      l = T(i);
    return (
      n.get('/email', (o, a) => {
        if (o.session.authorized) return a.redirect('/');
        a.type('html').send(A(o.flash('error'), s, i));
      }),
      n.post('/email', async (o, a) => {
        let {email: d} = o.body;
        if (!B.test(d)) return l(o, a, '\u90AE\u7BB1\u683C\u5F0F\u4E0D\u6B63\u786E');
        if (!r?.has(d)) return l(o, a, '\u8BE5\u90AE\u7BB1\u65E0\u8BBF\u95EE\u6743\u9650');
        let f = E();
        p.set(d, f);
        try {
          await g({email: d, code: f});
        } catch {
          return l(o, a, '\u9A8C\u8BC1\u7801\u53D1\u9001\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5');
        }
        ((o.session.pendingEmail = d), await new Promise(u => o.session.save(u)), a.redirect(`${i}/code`));
      }),
      n.get('/code', (o, a) => {
        if (!o.session.pendingEmail)
          return l(o, a, '\u8BF7\u5148\u8F93\u5165\u90AE\u7BB1\u83B7\u53D6\u9A8C\u8BC1\u7801');
        if (o.session.authorized) return a.redirect('/');
        a.type('html').send(S(o.session.pendingEmail, o.flash('error'), s, i, t));
      }),
      n.post('/code', async (o, a) => {
        let d = o.session.pendingEmail;
        if (!d) return l(o, a, '\u4F1A\u8BDD\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u83B7\u53D6\u9A8C\u8BC1\u7801');
        let f = p.get(d);
        if (p.isExpired(f))
          return (p.delete(d), l(o, a, '\u9A8C\u8BC1\u7801\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u83B7\u53D6'));
        if ((f.attempts++, f.attempts > t.maxAttempts))
          return (
            p.delete(d),
            l(o, a, '\u5C1D\u8BD5\u6B21\u6570\u8FC7\u591A\uFF0C\u8BF7\u91CD\u65B0\u83B7\u53D6\u9A8C\u8BC1\u7801')
          );
        if (f.code !== o.body.code) return l(o, a, '\u9A8C\u8BC1\u7801\u9519\u8BEF', 'code');
        (p.delete(d),
          await new Promise((u, I) => {
            o.session.regenerate(b => {
              if (b) return I(b);
              ((o.session.authorized = !0), (o.session.email = d), u());
            });
          }),
          a.redirect('/'));
      }),
      n.get('/logout', (o, a) => {
        o.session.destroy(() => a.redirect(`${i}/email`));
      }),
      n
    );
  };
var P = t => Object.prototype.toString.call(t).slice(8, -1).toLowerCase(),
  C = t => {
    if (!t) return null;
    let e = P(t);
    return (
      e === 'set' || e === 'map' ? t
      : e === 'array' ? new Set(t)
      : new Set(
          t
            .replaceAll(
              ',',
              `
`,
            )
            .split(
              `
`,
            )
            .map(r => r.trim().toLowerCase())
            .filter(Boolean),
        )
    );
  };
var c = (t, e) => process.env[t] ?? e,
  k = {
    session: {secret: c('SESSION_SECRET', ''), maxAge: Number(c('SESSION_COOKIE_MAXAGE', 30))},
    code: {
      ttl: Number(c('CODE_TTL_MS', 3e5)),
      len: Number(c('CODE_LENGTH', 6)),
      maxAttempts: Number(c('CODE_MAX_ATTEMPTS', 5)),
    },
    mail: {
      host: c('MAIL_HOST', ''),
      port: Number(c('MAIL_PORT', 587)),
      auth: JSON.parse(c('MAIL_AUTH', '{}')),
      from: c('MAIL_FROM'),
    },
    allowedEmails: c('ALLOWED_EMAILS'),
    authpath: '/authCode',
  },
  z = t => {
    let e = {...k, ...t};
    if (((e.allowedEmails = C(e.allowedEmails)), !e.session?.secret))
      throw new Error('\u8BF7\u914D\u7F6E [session.secret] \uFF01');
    if (!e.mail?.host || !e.mail?.auth)
      throw new Error(
        '\u8BF7\u5B8C\u5584\u90AE\u7BB1\u914D\u7F6E\uFF0C\u5982 [mail.auth] \u7B49\uFF0C\u53C2\u7167 [nodemailer] \u914D\u7F6E\u3002',
      );
    if (!e.allowedEmails?.size)
      throw new Error('\u8BF7\u914D\u7F6E\u56E2\u961F\u8BBF\u95EE\u8005\u90AE\u7BB1 [allowedEmails] \uFF01');
    return e;
  };
var Z = (t = {}, e) => {
  let r = z(t);
  (e.use(x(r.session), v()), e.use(r.authpath, F({extended: !0}), L(r, N)), e.use(w(r.authpath)));
};
export {Z as codeAuth};
