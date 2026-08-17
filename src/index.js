var Y = Object.defineProperty;
var Z = (e, t, r) => () => {
  if (r) throw r[0];
  try {
    return (e && (t = e((e = 0))), t);
  } catch (o) {
    throw ((r = [o]), o);
  }
};
var q = (e, t) => {
  for (var r in t) Y(e, r, {get: t[r], enumerable: !0});
};
var k = {};
q(k, {basicAuth: () => L, default: () => ye});
import {timingSafeEqual as j} from 'node:crypto';
var he,
  ge,
  L,
  ye,
  O = Z(() => {
    ((he = (e, t) => {
      let r = Buffer.from(e ?? '', 'utf8'),
        o = Buffer.from(t ?? '', 'utf8');
      return r.length !== o.length ? (j(r, Buffer.alloc(r.length)), !1) : j(r, o);
    }),
      (ge = e => {
        if (!e?.startsWith('Basic ')) return null;
        let t = Buffer.from(e.slice(6), 'base64').toString('utf8'),
          r = t.indexOf(':');
        return r === -1 ? null : {username: t.slice(0, r), password: t.slice(r + 1)};
      }),
      (L = ({realm: e = 'Restricted', users: t, authorize: r, skip: o, unauthorizedResponse: s} = {}) => {
        let n = a =>
            typeof o == 'function' ? o(a)
            : o instanceof RegExp ? o.test(a.path)
            : Array.isArray(o) ? o.includes(a.path)
            : !1,
          i = (a, u, l) => {
            if (typeof r == 'function') return r(a, u, l);
            if (t) {
              let p = t[a];
              return p !== void 0 && he(u, p);
            }
            return !1;
          },
          c = (a, u) => {
            a.set('WWW-Authenticate', `Basic realm="${e}", charset="UTF-8"`);
            let l = typeof s == 'function' ? s(u) : void 0;
            a.status(401).send(l);
          };
        return async (a, u, l) => {
          if (n(a)) return l();
          let p = a.headers['proxy-authorization'] || a.headers.authorization,
            h = ge(p);
          if (!h) return c(u, a);
          try {
            if (!(await i(h.username, h.password, a))) return c(u, a);
            ((a.basicAuthInfo = {username: h.username}), l());
          } catch {
            u.status(500).end();
          }
        };
      }),
      (ye = L));
  });
import y from 'express';
import Le from 'cors';
import {rateLimit as ke, ipKeyGenerator as Oe} from 'express-rate-limit';
import F from 'compression';
import {createServer as V} from 'node:http';
import Re from 'node:https';
var ee = async (e = {}, t) => {
    let r = (await import('pino')).default,
      o = t === 'development',
      s = r({
        name: 'Huxy',
        level: 'info',
        timestamp: r.stdTimeFunctions.isoTime,
        base: o ? void 0 : {},
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.headers["x-api-key"]',
            'body.password',
            '*.token',
          ],
          remove: !0,
        },
        transport:
          o ?
            {
              target: 'pino-pretty',
              options: {colorize: !0, translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', ignore: 'pid,hostname,name'},
            }
          : void 0,
        ...e,
      });
    return ((s.isPino = !0), s);
  },
  A = ee;
import te from 'node:os';
import re from 'node:net';
var m = (e = new Date()) => e.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  d = e => Object.prototype.toString.call(e).slice(8, -1).toLowerCase(),
  oe = e => {
    let t = e ? 'https' : 'http',
      r = te.networkInterfaces(),
      o = [];
    return (Object.keys(r).map(n => o.push(...r[n])), o.filter(n => n.family === 'IPv4').map(n => n.address));
  },
  se = e => {
    let t = e ?? process.argv.slice(2) ?? [],
      r = {};
    return (
      t.map(o => {
        let [s, n] = o.split('=');
        r[s] = n;
      }),
      r
    );
  },
  ne = {
    NODE_ENV: 'nodeEnv',
    PORT: 'port',
    STATIC_PORT: 'staticPort',
    HOST: 'host',
    BASEPATH: 'basepath',
    CORS_ORIGIN: 'cors.origin',
    RATE_LIMIT_WINDOW_MS: 'rateLimit.windowMs',
    RATE_LIMIT_MAX_REQUESTS: 'rateLimit.limit',
    LOG_LEVEL: 'logLevel',
    API_PREFIX: 'apiPrefix',
    JWT_SECRET: 'secret',
    AUTH_TOKEN: 'authToken',
  },
  ie = (e, t, r) => {
    let [o, s] = e.split('.');
    o && s ? (r[o] || (r[o] = {}), (r[o][s] = t)) : (r[o] = t);
  },
  ae = e => {
    let {connectSrc: t, ...r} = e;
    if (!t) return r;
    (r.helmet.contentSecurityPolicy || (r.helmet.contentSecurityPolicy = {}),
      r.helmet.contentSecurityPolicy.directives || (r.helmet.contentSecurityPolicy.directives = {}));
    let o =
      typeof t == 'string' ? t.split(',').map(s => s.trim())
      : Array.isArray(t) ? t
      : [];
    return (
      (r.helmet.contentSecurityPolicy.directives.connectSrc = [
        ...r.helmet.contentSecurityPolicy.directives.connectSrc,
        ...o,
      ]),
      r
    );
  },
  ce = e =>
    (e || '').length < 2 ? '/'
    : e.endsWith('/') ? e.slice(0, -1)
    : e,
  w = (e = {}, t = ne) => {
    let {env: r} = process;
    Object.keys(t).map(s => {
      let n = r[s] ?? e[s];
      n && ie(t[s], n, e);
    });
    let o = {...e, ...se()};
    return (
      (o.port = o.staticPort || o.port),
      (o.isDev = o.nodeEnv === 'development'),
      (o.basepath = ce(o.basepath)),
      (o.protocol = 'http'),
      ae(o)
    );
  },
  S = e =>
    new Promise(t => {
      let r = re.createServer();
      (r.once('error', o => {
        (r.close(), t((o.code === 'EADDRINUSE', !1)));
      }),
        r.once('listening', () => {
          (r.close(), t(!0));
        }),
        r.listen(Number(e)));
    }),
  T = (e, t = {}, r) => {
    let o = s => {
      (r.warn(`\u6536\u5230 ${s} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        e.close(async () => {
          (r.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), await t.shutdown?.(), process.exit(0));
        }),
        setTimeout(() => {
          (r.error('\u274C \u5F3A\u5236\u5173\u95ED\u670D\u52A1\u5668'), process.exit(1));
        }, 3e3));
    };
    (process.on('SIGTERM', () => o('SIGTERM')),
      process.on('SIGINT', () => o('SIGINT')),
      process.on('uncaughtException', s => {
        (r.fatal(s, `\u{1F4A5} \u672A\u6355\u83B7\u7684\u5F02\u5E38: ${s.message}`), process.exit(1));
      }),
      process.on('unhandledRejection', (s, n) => {
        (r.fatal({reason: s, promise: n}, '\u26A0\uFE0F \u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'),
          process.exit(1));
      }));
  },
  P = (e, {port: t = 3e3, host: r} = {}) =>
    new Promise((o, s) => {
      (e.once('error', s), e.once('listening', () => o(e)), e.listen(t, r));
    }),
  ue = (e, t = 56) => {
    let r = e.length,
      o = t - r,
      s = ~~(o / 2);
    return `${'-'.repeat(s)}${e}${'-'.repeat(o - s)}`;
  },
  E = (e = {}, t) => {
    let {port: r, host: o, basepath: s, appName: n = 'HuxyServer', protocol: i, serverLogger: c} = e;
    if (typeof c == 'function') return c(e, t);
    let a = o || 'localhost',
      u = oe()
        .filter(l => l !== a)
        .map(l => `${i}://${l}:${r}${s}`);
    (t.info(ue(n)),
      t.info(`\u{1F680} \u670D\u52A1\u6B63\u5728\u8FD0\u884C: ${i}://${a}:${r}${s}`),
      t.info(`-----------------[${m()}]------------------`),
      t.info({ips: u}, '\u672C\u5730\u5730\u5740'));
  };
var I = (e, t) => (r, o, s) => {
    (t.error(
      {
        message: 'Not Found',
        timestamp: m(),
        url: r.originalUrl,
        method: r.method,
        ip: r.ip,
        userAgent: r.get('User-Agent'),
      },
      '\u627E\u4E0D\u5230\u8DEF\u5F84',
    ),
      o
        .status(404)
        .json({
          success: !1,
          status: 404,
          url: r.originalUrl,
          message: `\u8DEF\u7531 [${r.method} ${r.originalUrl}] \u4E0D\u5B58\u5728`,
          timestamp: m(),
        }));
  },
  $ = (e, t) => (r, o, s, n) => {
    let i = r.status || 500,
      c = r.message,
      a = '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF';
    (t.error(
      {
        message: c,
        timestamp: m(),
        stack: r.stack,
        url: o.originalUrl,
        method: o.method,
        ip: o.ip,
        userAgent: o.get('User-Agent'),
      },
      a,
    ),
      s.status(i).json({success: !1, message: e.isDev ? c : a, stack: e.isDev ? r.stack : void 0, timestamp: m()}));
  };
import {fileURLToPath as le} from 'node:url';
import {dirname as pe, resolve as me} from 'node:path';
var de =
    (e = import.meta.url) =>
    (...t) =>
      me(pe(le(e)), ...t),
  H = de;
var fe = H(import.meta.url),
  b = (e, {basepath: t, buildPath: r} = {}) => {
    t !== '/' &&
      e.get(t, (s, n, i) => {
        n.redirect(308, `${t}/${s.search ?? ''}`);
      });
    let o = t === '/' ? t : `${t}/`;
    e.get(`${o}{*splat}`, (s, n, i) => {
      if (n.headersSent) return i();
      n.sendFile(fe(r, 'index.html'));
    });
  };
var xe = async (e, t) => {
    let r = (await Promise.resolve().then(() => (O(), k))).default;
    t.use(
      r({
        realm: 'Ihuxy Team',
        unauthorizedResponse: o => ({
          message: '\u672A\u6388\u6743\uFF0C\u8BF7\u8054\u7CFB Ihuxy \u5DE5\u4F5C\u5BA4\uFF01ah.yiru@gmail.com',
        }),
        users: {ihuxy: '123456'},
        ...e,
      }),
    );
  },
  R = xe;
import {createProxyMiddleware as Pe} from 'http-proxy-middleware';
import ve from 'jsonwebtoken';
var M = (e, {secret: t = '', ...r} = {}) => ve.verify(e, t, r);
var _ =
  (e = {}) =>
  (t, r, o) => {
    let s = t.headers.authorization;
    if (!s)
      return (
        t.log.error('\u8BA4\u8BC1\u5931\u8D25: \u7F3A\u5C11\u8BA4\u8BC1\u4FE1\u606F'),
        r.status(401).json({message: '\u7F3A\u5C11\u8BA4\u8BC1\u4FE1\u606F'})
      );
    if (!s.startsWith('Bearer '))
      return (
        t.log.error('\u8BA4\u8BC1\u5931\u8D25: \u672A\u63D0\u4F9B\u6709\u6548\u8BA4\u8BC1\u4FE1\u606F'),
        r.status(401).json({message: '\u672A\u63D0\u4F9B\u6709\u6548\u8BA4\u8BC1\u4FE1\u606F'})
      );
    let n = s.split(' ')[1];
    if (!n)
      return (
        t.log.error('\u8BA4\u8BC1\u5931\u8D25: \u8BBF\u95EE\u4EE4\u724C\u7F3A\u5931'),
        r.status(401).json({message: '\u8BBF\u95EE\u4EE4\u724C\u7F3A\u5931'})
      );
    try {
      let i = M(n, e);
      (t.log.info(i, '\u8BA4\u8BC1\u6210\u529F'), (t.user = i), o());
    } catch (i) {
      let c = i.type || i.name;
      return (
        c === 'TokenExpiredError' ?
          (t.log.error({ip: t.ip}, '\u8BA4\u8BC1\u5931\u8D25: \u4EE4\u724C\u5DF2\u8FC7\u671F'),
          r.status(401).json({message: '\u4EE4\u724C\u5DF2\u8FC7\u671F'}))
        : c === 'JsonWebTokenError' ?
          (t.log.error({ip: t.ip}, '\u8BA4\u8BC1\u5931\u8D25: \u65E0\u6548\u7684\u4EE4\u724C'),
          r.status(403).json({message: '\u65E0\u6548\u7684\u4EE4\u724C'}))
        : c === 'AuthorizationError' ?
          (t.log.error({ip: t.ip}, `\u8BA4\u8BC1\u5931\u8D25: ${i.message}`),
          r.status(i.status).json({message: i.message}))
        : (t.log.error({err: i, ip: t.ip}, '\u8BA4\u8BC1\u5931\u8D25: \u5185\u90E8\u670D\u52A1\u5668\u9519\u8BEF'),
          r.status(500).json({message: '\u5185\u90E8\u670D\u52A1\u5668\u9519\u8BEF'}))
      );
    }
  };
var Ae = e =>
    d(e) === 'object' ? [e]
    : Array.isArray(e) ? e
    : [],
  C = ({proxys: e = [], apiPrefix: t = '/'} = {}) =>
    Ae(e).map(r => ((r.prefix = `${t}${r.prefix ?? (r.name ? `/${r.name}` : '')}`.replace('//', '/')), r)),
  N = e => (Array.isArray(e) ? e : []).filter(Boolean),
  U = (e, t) =>
    [...new Set(['/', '/health', t, ...(Array.isArray(e) ? e : [])])]
      .filter(Boolean)
      .map(r => `${t}${r}`.replace('//', '/'));
var we =
    (e = {}) =>
    (t, r, o) => {
      if (t.method === 'OPTIONS') return o();
      let s = N(e.whiteAuthKeys);
      if (U(e.whitePathList, e.apiPrefix).includes(t.path)) return o();
      let {authToken: i, jwtConfig: c} = e;
      if (typeof i == 'string' && i.length > 0 && i !== 'false') {
        let u = t.headers,
          l = u['x-huxy-auth'] || u['x-api-key'] || u.authorization || '',
          p = t.query.token || l.split('Bearer ')[1];
        return (p && p === i) || s.includes(p) ?
            o()
          : (t.log.error('\u8BA4\u8BC1\u5931\u8D25: \u65E0\u6548\u7684\u4EE4\u724C'),
            r.status(403).json({message: '\u65E0\u6548\u7684\u4EE4\u724C'}));
      }
      if (d(c) === 'object') return _({secret, expiresIn, algorithm, issuer})(t, r, o);
      o();
    },
  W = we;
var Se = [
    'origin',
    'referer',
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'cf-ipcountry',
    'cf-ray',
    'x-huxy-auth',
  ],
  Te = ['x-powered-by', 'server'],
  B = (e, t) => {
    (Se.forEach(r => e.removeHeader(r)), e.setHeader('Host', t), e.setHeader('User-Agent', 'IHUXY-API/1.0'));
  },
  D = e => {
    (Te.forEach(t => e.removeHeader(t)),
      e.setHeader('Access-Control-Allow-Origin', '*'),
      e.setHeader('X-Content-Type-Options', 'nosniff'),
      e.getHeader('content-type')?.includes('text/event-stream') &&
        ((e.headers['Cache-Control'] = 'no-cache, no-transform'),
        (e.headers.Connection = 'keep-alive'),
        (e.headers['X-Accel-Buffering'] = 'no')));
  };
var Ee = (e, t = '/') => {
    let r = {
      status: 'OK',
      message: `API \u670D\u52A1\u5668\u8FD0\u884C\u4E2D \u{1F449} ${t}`,
      timestamp: m(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
    e.get(`${t}/health`.replace('//', '/'), (o, s) => {
      s.status(200).json(r);
    });
  },
  Ie = ({target: e = 'http://', prefix: t, withPrefix: r, preserve: o = !1, ...s} = {}) => ({
    target: e,
    changeOrigin: !0,
    secure: !1,
    xfwd: !0,
    ws: !0,
    on: {
      proxyReq: (n, i, c) => {
        n.removeHeader && !o && B(n, e);
      },
      proxyRes: (n, i, c) => {
        n.removeHeader && !o && D(n);
      },
      error: (n, i, c) => {
        let a = i.headers.upgrade?.toLowerCase() === 'websocket',
          u = i.url.includes('/socket.io') || i.url.includes('EIO=');
        !a && !u && (c.headersSent || c.status(502).json({error: '\u7F51\u5173\u9519\u8BEF'}));
      },
    },
    ...s,
  }),
  $e = (e, t = {}, r, o) => {
    let {apiPrefix: s = '/', proxyList: n = []} = t;
    (r.info(`\u{1F4DD} API \u63A5\u53E3\u5730\u5740: ${t.protocol}://${t.host ?? 'localhost'}:${t.port}${s}`),
      n.map(({prefix: i, target: c, withPrefix: a = !0, ...u}) => {
        c = a ? `${c}${i}` : c;
        let l = Pe(Ie({prefix: i, target: c, withPrefix: a, ...u}));
        (e.use(i, W(t), l), r.info(`\u2705 \u4EE3\u7406\u4E2D ${i} \u{1F449} ${c}`), o.on('upgrade', l.upgrade));
      }),
      Ee(e, s));
  },
  z = $e;
import {Router as He} from 'express';
var be = e => {
    let t = He();
    return (
      t.use('/health', (r, o) => {
        o.status(200).json({
          status: 'OK',
          timestamp: m(),
          environment: e.nodeEnv,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          pid: process.pid,
        });
      }),
      t.get('/', (r, o) => {
        o.status(200).json({
          message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D',
          timestamp: m(),
          environment: e.nodeEnv,
        });
      }),
      t
    );
  },
  G = be;
var je = {
    nodeEnv: process.env.NODE_ENV,
    isDev: process.env.NODE_ENV === 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST,
    basepath: process.env.BASEPATH || '/',
    apiPrefix: process.env.API_PREFIX || '/',
    whitePathList: ['/health'],
    cors: {origin: process.env.CORS_ORIGIN?.split(',') || '*'},
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000', 10),
      limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '150', 10),
      skip: e => {
        if (e.headers.upgrade?.toLowerCase() === 'websocket' || e.url.includes('/socket.io') || e.url.includes('EIO='))
          return !0;
        let {path: t} = e;
        return !!(
          t.startsWith('/static/') ||
          /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/i.test(t) ||
          t === '/health' ||
          t === '/ready'
        );
      },
      message: {message: '\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5'},
    },
    logLevel: process.env.LOG_LEVEL || 30,
  },
  K = je;
var Me = async (e, t = {}, r) => {
    if ((e.disable('x-powered-by'), e.set('trust proxy', t.trustProxy ?? !0), r.isPino)) {
      let s = (await import('pino-http')).default;
      e.use(s({logger: r, quietReqLogger: !0, autoLogging: !1, genReqId: !1}));
    } else
      e.use((s, n, i) => {
        ((s.log = r), i());
      });
    e.use(Le(t.cors));
    let {helmet: o} = t;
    if (o) {
      let s = (await import('helmet')).default;
      e.use(s(d(o) === 'object' ? o : void 0));
    }
    e.use(F({filter: (s, n) => (n.getHeader('Content-Type') === 'text/event-stream' ? !1 : F.filter(s, n))}));
  },
  _e = (e, t = {}) => {
    e.use(
      t.basepath,
      y.static(t.buildPath, {
        immutable: !0,
        maxAge: '1y',
        setHeaders: (r, o) => {
          o.endsWith('.html') && r.setHeader('Cache-Control', 'no-cache, must-revalidate');
        },
        ...t.staticCache,
      }),
    );
  },
  Ce = (e, t = {}, r, o) => {
    e.use(
      t.apiPrefix,
      ke({
        keyGenerator: n => Oe(n.ip) || n.headers['x-huxy-auth'] || n.headers['x-api-key'] || n.headers.authorization,
        ...t.rateLimit,
      }),
    );
    let s = C(t);
    (s.length && z(e, {...t, proxyList: s}, r, o),
      e.use(y.json({limit: '20mb'})),
      e.use(y.urlencoded({extended: !0, limit: '20mb'})));
  },
  Ne = (e, t = {}, r, o) => {
    (o && b(e, t), e.use(G(t)), e.use(I(t, r)), e.use($(t, r)));
  },
  Ue =
    e =>
    async (t = {}, r) => {
      let {logger: o, ...s} = w({...K, ...t}),
        n = o ?? (await A(s.loggerConfig, s.nodeEnv)),
        {port: i, ssl: c} = s;
      (await S(i)) ||
        ((s.port = Number(i) + 1),
        n.warn(`\u7AEF\u53E3 ${i} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${s.port}`));
      let u = y();
      await Me(u, s, n);
      let l;
      c ?
        (d(c) === 'object' ||
          (n.error(
            {ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}},
            '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}',
          ),
          process.exit(1)),
        (s.protocol = 'https'),
        (l = Re.createServer(c, u)),
        V((x, v) => {
          (v.writeHead(301, {Location: `${s.protocol}://${x.headers.host}${x.url}`}), v.end());
        }).listen(80))
      : (l = V(u));
      let {basicAuth: p} = s;
      (d(p) === 'object' && (await R(p, u)), e && _e(u, s), Ce(u, s, n, l));
      let {cors: h, helmet: Q, rateLimit: Be, ...f} = s;
      try {
        await r?.(f, u, l, n);
      } catch (g) {
        (n.error({err: g}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${g.message}`), process.exit(1));
      }
      Ne(u, f, n, e);
      try {
        (await P(l, f), E(f, n));
      } catch (g) {
        (n.error({err: g}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25\uFF01'), process.exit(1));
      }
      return (T(l, f, n), {config: f, app: u, httpServer: l, logger: n});
    },
  X = Ue;
var J = X,
  We = J(),
  Bt = J(!0),
  Dt = We;
export {Dt as default, J as startApp, We as startServer, Bt as startStatic};
