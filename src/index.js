var Y = Object.defineProperty;
var Z = (r, e, t) => () => {
  if (t) throw t[0];
  try {
    return (r && (e = r((r = 0))), e);
  } catch (o) {
    throw ((t = [o]), o);
  }
};
var q = (r, e) => {
  for (var t in e) Y(r, t, {get: e[t], enumerable: !0});
};
var L = {};
q(L, {basicAuth: () => b, default: () => xe});
import {timingSafeEqual as j} from 'node:crypto';
var he,
  ye,
  b,
  xe,
  O = Z(() => {
    ((he = (r, e) => {
      let t = Buffer.from(r ?? '', 'utf8'),
        o = Buffer.from(e ?? '', 'utf8');
      return t.length !== o.length ? (j(t, Buffer.alloc(t.length)), !1) : j(t, o);
    }),
      (ye = r => {
        if (!r?.startsWith('Basic ')) return null;
        let e = Buffer.from(r.slice(6), 'base64').toString('utf8'),
          t = e.indexOf(':');
        return t === -1 ? null : {username: e.slice(0, t), password: e.slice(t + 1)};
      }),
      (b = ({realm: r = 'Restricted', users: e, authorize: t, skip: o, unauthorizedResponse: s} = {}) => {
        let n = c =>
            typeof o == 'function' ? o(c)
            : o instanceof RegExp ? o.test(c.path)
            : Array.isArray(o) ? o.includes(c.path)
            : !1,
          i = (c, u, l) => {
            if (typeof t == 'function') return t(c, u, l);
            if (e) {
              let p = e[c];
              return p !== void 0 && he(u, p);
            }
            return !1;
          },
          a = (c, u) => {
            c.set('WWW-Authenticate', `Basic realm="${r}", charset="UTF-8"`);
            let l = typeof s == 'function' ? s(u) : void 0;
            c.status(401).send(l);
          };
        return async (c, u, l) => {
          if (n(c)) return l();
          let p = c.headers['proxy-authorization'] || c.headers.authorization,
            h = ye(p);
          if (!h) return a(u, c);
          try {
            if (!(await i(h.username, h.password, c))) return a(u, c);
            ((c.basicAuthInfo = {username: h.username}), l());
          } catch {
            u.status(500).end();
          }
        };
      }),
      (xe = b));
  });
import x from 'express';
import be from 'cors';
import {rateLimit as Le, ipKeyGenerator as Oe} from 'express-rate-limit';
import F from 'compression';
import {createServer as V} from 'node:http';
import ke from 'node:https';
var ee = async (r = {}, e) => {
    let t = (await import('pino')).default,
      o = e === 'development',
      s = t({
        name: 'Huxy',
        level: 'info',
        timestamp: t.stdTimeFunctions.isoTime,
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
        ...r,
      });
    return ((s.isPino = !0), s);
  },
  A = ee;
import te from 'node:os';
import re from 'node:net';
var m = (r = new Date()) => r.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  d = r => Object.prototype.toString.call(r).slice(8, -1).toLowerCase(),
  oe = r => {
    let e = r ? 'https' : 'http',
      t = te.networkInterfaces(),
      o = [];
    return (Object.keys(t).map(n => o.push(...t[n])), o.filter(n => n.family === 'IPv4').map(n => n.address));
  },
  se = r => {
    let e = r ?? process.argv.slice(2) ?? [],
      t = {};
    return (
      e.map(o => {
        let [s, n] = o.split('=');
        t[s] = n;
      }),
      t
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
  ie = (r, e, t) => {
    let [o, s] = r.split('.');
    o && s ? (t[o] || (t[o] = {}), (t[o][s] = e)) : (t[o] = e);
  },
  ae = r => {
    let {connectSrc: e, ...t} = r;
    if (!e) return t;
    (t.helmet.contentSecurityPolicy || (t.helmet.contentSecurityPolicy = {}),
      t.helmet.contentSecurityPolicy.directives || (t.helmet.contentSecurityPolicy.directives = {}));
    let o =
      typeof e == 'string' ? e.split(',').map(s => s.trim())
      : Array.isArray(e) ? e
      : [];
    return (
      (t.helmet.contentSecurityPolicy.directives.connectSrc = [
        ...t.helmet.contentSecurityPolicy.directives.connectSrc,
        ...o,
      ]),
      t
    );
  },
  ce = r =>
    (r || '').length < 2 ? '/'
    : r.endsWith('/') ? r.slice(0, -1)
    : r,
  w = (r = {}, e = ne) => {
    let {env: t} = process;
    Object.keys(e).map(s => {
      let n = t[s] ?? r[s];
      n && ie(e[s], n, r);
    });
    let o = {...r, ...se()};
    return (
      (o.port = o.staticPort || o.port),
      (o.isDev = o.nodeEnv === 'development'),
      (o.basepath = ce(o.basepath)),
      (o.protocol = 'http'),
      ae(o)
    );
  },
  S = r =>
    new Promise(e => {
      let t = re.createServer();
      (t.once('error', o => {
        (t.close(), e((o.code === 'EADDRINUSE', !1)));
      }),
        t.once('listening', () => {
          (t.close(), e(!0));
        }),
        t.listen(Number(r)));
    }),
  T = (r, e = {}, t) => {
    let o = s => {
      (t.warn(`\u6536\u5230 ${s} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        r.close(async () => {
          (t.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), await e.shutdown?.(), process.exit(0));
        }),
        setTimeout(() => {
          (t.error('\u274C \u5F3A\u5236\u5173\u95ED\u670D\u52A1\u5668'), process.exit(1));
        }, 3e3));
    };
    (process.on('SIGTERM', () => o('SIGTERM')),
      process.on('SIGINT', () => o('SIGINT')),
      process.on('uncaughtException', s => {
        (t.fatal(s, `\u{1F4A5} \u672A\u6355\u83B7\u7684\u5F02\u5E38: ${s.message}`), process.exit(1));
      }),
      process.on('unhandledRejection', (s, n) => {
        (t.fatal({reason: s, promise: n}, '\u26A0\uFE0F \u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'),
          process.exit(1));
      }));
  },
  P = (r, {port: e = 3e3, host: t} = {}) =>
    new Promise((o, s) => {
      (r.once('error', s), r.once('listening', () => o(r)), r.listen(e, t));
    }),
  ue = (r, e = 56) => {
    let t = r.length,
      o = e - t,
      s = ~~(o / 2);
    return `${'-'.repeat(s)}${r}${'-'.repeat(o - s)}`;
  },
  E = (r = {}, e) => {
    let {port: t, host: o, basepath: s, appName: n = 'HuxyServer', protocol: i, serverLogger: a} = r;
    if (typeof a == 'function') return a(r, e);
    let c = o || 'localhost',
      u = oe()
        .filter(l => l !== c)
        .map(l => `${i}://${l}:${t}${s}`);
    (e.info(ue(n)),
      e.info(`\u{1F680} \u670D\u52A1\u6B63\u5728\u8FD0\u884C: ${i}://${c}:${t}${s}`),
      e.info(`-----------------[${m()}]------------------`),
      e.info({ips: u}, '\u672C\u5730\u5730\u5740'));
  };
var I = (r, e) => (t, o, s) => {
    (e.error(
      {
        message: 'Not Found',
        timestamp: m(),
        url: t.originalUrl,
        method: t.method,
        ip: t.ip,
        userAgent: t.get('User-Agent'),
      },
      '\u627E\u4E0D\u5230\u8DEF\u5F84',
    ),
      o
        .status(404)
        .json({
          success: !1,
          status: 404,
          url: t.originalUrl,
          message: `\u8DEF\u7531 [${t.method} ${t.originalUrl}] \u4E0D\u5B58\u5728`,
          timestamp: m(),
        }));
  },
  $ = (r, e) => (t, o, s, n) => {
    let i = t.status || 500,
      a = t.message,
      c = '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF';
    (e.error(
      {
        message: a,
        timestamp: m(),
        stack: t.stack,
        url: o.originalUrl,
        method: o.method,
        ip: o.ip,
        userAgent: o.get('User-Agent'),
      },
      c,
    ),
      s.status(i).json({success: !1, message: r.isDev ? a : c, stack: r.isDev ? t.stack : void 0, timestamp: m()}));
  };
import {fileURLToPath as le} from 'node:url';
import {dirname as pe, resolve as me} from 'node:path';
var de =
    (r = import.meta.url) =>
    (...e) =>
      me(pe(le(r)), ...e),
  H = de;
var fe = H(import.meta.url),
  R = (r, {basepath: e, buildPath: t} = {}) => {
    e !== '/' &&
      r.get(e, (s, n, i) => {
        n.redirect(308, `${e}/${s.search ?? ''}`);
      });
    let o = e === '/' ? e : `${e}/`;
    r.get(`${o}{*splat}`, (s, n, i) => {
      if (n.headersSent) return i();
      n.sendFile(fe(t, 'index.html'));
    });
  };
var ge = async (r, e) => {
    let t = (await Promise.resolve().then(() => (O(), L))).default;
    e.use(
      t({
        realm: 'Ihuxy Team',
        unauthorizedResponse: o => ({
          message: '\u672A\u6388\u6743\uFF0C\u8BF7\u8054\u7CFB Ihuxy \u5DE5\u4F5C\u5BA4\uFF01ah.yiru@gmail.com',
        }),
        users: {ihuxy: '123456'},
        ...r,
      }),
    );
  },
  k = ge;
import {createProxyMiddleware as Pe} from 'http-proxy-middleware';
import ve from 'jsonwebtoken';
var M = (r, {secret: e = '', ...t} = {}) => ve.verify(r, e, t);
var _ =
  (r = {}) =>
  (e, t, o) => {
    let s = e.headers.authorization;
    if (!s)
      return (
        e.log.error('\u8BA4\u8BC1\u5931\u8D25: \u7F3A\u5C11\u8BA4\u8BC1\u4FE1\u606F'),
        t.status(401).json({message: '\u7F3A\u5C11\u8BA4\u8BC1\u4FE1\u606F'})
      );
    if (!s.startsWith('Bearer '))
      return (
        e.log.error('\u8BA4\u8BC1\u5931\u8D25: \u672A\u63D0\u4F9B\u6709\u6548\u8BA4\u8BC1\u4FE1\u606F'),
        t.status(401).json({message: '\u672A\u63D0\u4F9B\u6709\u6548\u8BA4\u8BC1\u4FE1\u606F'})
      );
    let n = s.split(' ')[1];
    if (!n)
      return (
        e.log.error('\u8BA4\u8BC1\u5931\u8D25: \u8BBF\u95EE\u4EE4\u724C\u7F3A\u5931'),
        t.status(401).json({message: '\u8BBF\u95EE\u4EE4\u724C\u7F3A\u5931'})
      );
    try {
      let i = M(n, r);
      (e.log.info(i, '\u8BA4\u8BC1\u6210\u529F'), (e.user = i), o());
    } catch (i) {
      let a = i.type || i.name;
      return (
        a === 'TokenExpiredError' ?
          (e.log.error({ip: e.ip}, '\u8BA4\u8BC1\u5931\u8D25: \u4EE4\u724C\u5DF2\u8FC7\u671F'),
          t.status(401).json({message: '\u4EE4\u724C\u5DF2\u8FC7\u671F'}))
        : a === 'JsonWebTokenError' ?
          (e.log.error({ip: e.ip}, '\u8BA4\u8BC1\u5931\u8D25: \u65E0\u6548\u7684\u4EE4\u724C'),
          t.status(403).json({message: '\u65E0\u6548\u7684\u4EE4\u724C'}))
        : a === 'AuthorizationError' ?
          (e.log.error({ip: e.ip}, `\u8BA4\u8BC1\u5931\u8D25: ${i.message}`),
          t.status(i.status).json({message: i.message}))
        : (e.log.error({err: i, ip: e.ip}, '\u8BA4\u8BC1\u5931\u8D25: \u5185\u90E8\u670D\u52A1\u5668\u9519\u8BEF'),
          t.status(500).json({message: '\u5185\u90E8\u670D\u52A1\u5668\u9519\u8BEF'}))
      );
    }
  };
var Ae = r =>
    d(r) === 'object' ? [r]
    : Array.isArray(r) ? r
    : [],
  C = ({proxys: r = [], apiPrefix: e = '/'} = {}) =>
    Ae(r).map(t => ((t.prefix = `${e}${t.prefix ?? (t.name ? `/${t.name}` : '')}`.replace('//', '/')), t)),
  N = r => (Array.isArray(r) ? r : []).filter(Boolean),
  U = (r, e) =>
    [...new Set(['/', '/health', e, ...(Array.isArray(r) ? r : [])])]
      .filter(Boolean)
      .map(t => `${e}${t}`.replace('//', '/'));
var we =
    (r = {}) =>
    (e, t, o) => {
      if (e.method === 'OPTIONS') return o();
      let s = N(r.whiteAuthKeys);
      if (U(r.whitePathList, r.apiPrefix).includes(e.path)) return o();
      let {authToken: i, jwtConfig: a} = r;
      if (typeof i == 'string' && i.length > 0 && i !== 'false') {
        let u = e.headers,
          l = u['x-huxy-auth'] || u['x-api-key'] || u.authorization || '',
          p = e.query.token || l.split('Bearer ')[1];
        return (p && p === i) || s.includes(p) ?
            o()
          : (e.log.error('\u8BA4\u8BC1\u5931\u8D25: \u65E0\u6548\u7684\u4EE4\u724C'),
            t.status(403).json({message: '\u65E0\u6548\u7684\u4EE4\u724C'}));
      }
      if (d(a) === 'object') return _({secret, expiresIn, algorithm, issuer})(e, t, o);
      o();
    },
  B = we;
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
  D = (r, e) => {
    let t = new Headers(r);
    return (Se.forEach(o => t.delete(o)), t.set('Host', e), t.set('User-Agent', 'IHUXY-API/1.0'), t);
  },
  W = r => {
    let e = new Headers(r);
    return (
      Te.forEach(t => e.delete(t)),
      e.set('Access-Control-Allow-Origin', '*'),
      e.set('X-Content-Type-Options', 'nosniff'),
      e.get('content-type')?.includes('text/event-stream') &&
        ((e['Cache-Control'] = 'no-cache, no-transform'),
        (e.Connection = 'keep-alive'),
        (e['X-Accel-Buffering'] = 'no')),
      e
    );
  };
var Ee = (r, e = '/') => {
    let t = {
      status: 'OK',
      message: `API \u670D\u52A1\u5668\u8FD0\u884C\u4E2D \u{1F449} ${e}`,
      timestamp: m(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
    r.get(`${e}/health`.replace('//', '/'), (o, s) => {
      s.status(200).json(t);
    });
  },
  Ie = ({target: r = 'http://', prefix: e, withPrefix: t, preserve: o = !0, ...s} = {}) => ({
    target: r,
    changeOrigin: !0,
    secure: !1,
    xfwd: !0,
    ws: !0,
    followRedirects: !0,
    on: {
      proxyReq: (n, i, a) => {
        !o && D(n.headers, r);
      },
      proxyRes: (n, i, a) => {
        !o && W(n.headers);
      },
      error: (n, i, a) => {
        i.url.includes('/socket.io') ||
          i.url.includes('EIO=') ||
          a.headersSent ||
          a.status(502).json({error: '\u7F51\u5173\u9519\u8BEF'});
      },
    },
    ...s,
  }),
  $e = (r, e = {}, t, o) => {
    let {apiPrefix: s = '/', proxyList: n = []} = e;
    (t.info(`\u{1F4DD} API \u63A5\u53E3\u5730\u5740: ${e.protocol}://${e.host ?? 'localhost'}:${e.port}${s}`),
      n.map(({prefix: i, target: a, withPrefix: c = !0, ...u}) => {
        a = c ? `${a}${i}` : a;
        let l = Pe(Ie({prefix: i, target: a, withPrefix: c, ...u}));
        (r.use(i, B(e), l), t.info(`\u2705 \u4EE3\u7406\u4E2D ${i} \u{1F449} ${a}`), o.on('upgrade', l.upgrade));
      }),
      Ee(r, s));
  },
  z = $e;
import {Router as He} from 'express';
var Re = r => {
    let e = He();
    return (
      e.use('/health', (t, o) => {
        o.status(200).json({
          status: 'OK',
          timestamp: m(),
          environment: r.nodeEnv,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          pid: process.pid,
        });
      }),
      e.get('/', (t, o) => {
        o.status(200).json({
          message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D',
          timestamp: m(),
          environment: r.nodeEnv,
        });
      }),
      e
    );
  },
  G = Re;
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
      skip: r => {
        let {path: e, url: t} = r;
        return !!(
          t.includes('/socket.io') ||
          t.includes('EIO=') ||
          e.startsWith('/static/') ||
          /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/i.test(e) ||
          e === '/health' ||
          e === '/ready'
        );
      },
      message: {message: '\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5'},
    },
    logLevel: process.env.LOG_LEVEL || 30,
  },
  K = je;
var Me = async (r, e = {}, t) => {
    if ((r.disable('x-powered-by'), r.set('trust proxy', e.trustProxy ?? !0), t.isPino)) {
      let s = (await import('pino-http')).default;
      r.use(s({logger: t, quietReqLogger: !0, autoLogging: !1, genReqId: !1}));
    } else
      r.use((s, n, i) => {
        ((s.log = t), i());
      });
    r.use(be(e.cors));
    let {helmet: o} = e;
    if (o) {
      let s = (await import('helmet')).default;
      r.use(s(d(o) === 'object' ? o : void 0));
    }
    r.use(F({filter: (s, n) => (n.getHeader('Content-Type') === 'text/event-stream' ? !1 : F.filter(s, n))}));
  },
  _e = (r, e = {}) => {
    r.use(
      e.basepath,
      x.static(e.buildPath, {
        immutable: !0,
        maxAge: '1y',
        setHeaders: (t, o) => {
          o.endsWith('.html') && t.setHeader('Cache-Control', 'no-cache, must-revalidate');
        },
        ...e.staticCache,
      }),
    );
  },
  Ce = (r, e = {}, t, o) => {
    r.use(
      e.apiPrefix,
      Le({
        keyGenerator: n => Oe(n.ip) || n.headers['x-huxy-auth'] || n.headers['x-api-key'] || n.headers.authorization,
        ...e.rateLimit,
      }),
    );
    let s = C(e);
    (s.length && z(r, {...e, proxyList: s}, t, o),
      r.use(x.json({limit: '20mb'})),
      r.use(x.urlencoded({extended: !0, limit: '20mb'})));
  },
  Ne = (r, e = {}, t, o) => {
    (o && R(r, e), r.use(G(e)), r.use(I(e, t)), r.use($(e, t)));
  },
  Ue =
    r =>
    async (e = {}, t) => {
      let {logger: o, ...s} = w({...K, ...e}),
        n = o ?? (await A(s.loggerConfig, s.nodeEnv)),
        {port: i, ssl: a} = s;
      (await S(i)) ||
        ((s.port = Number(i) + 1),
        n.warn(`\u7AEF\u53E3 ${i} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${s.port}`));
      let u = x();
      await Me(u, s, n);
      let l;
      a ?
        (d(a) === 'object' ||
          (n.error(
            {ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}},
            '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}',
          ),
          process.exit(1)),
        (s.protocol = 'https'),
        (l = ke.createServer(a, u)),
        V((g, v) => {
          (v.writeHead(301, {Location: `${s.protocol}://${g.headers.host}${g.url}`}), v.end());
        }).listen(80))
      : (l = V(u));
      let {basicAuth: p} = s;
      (d(p) === 'object' && (await k(p, u)), r && _e(u, s), Ce(u, s, n, l));
      let {cors: h, helmet: Q, rateLimit: De, ...f} = s;
      try {
        await t?.(f, u, l, n);
      } catch (y) {
        (n.error({err: y}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${y.message}`), process.exit(1));
      }
      Ne(u, f, n, r);
      try {
        (await P(l, f), E(f, n));
      } catch (y) {
        (n.error({err: y}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25\uFF01'), process.exit(1));
      }
      return (T(l, f, n), {config: f, app: u, httpServer: l, logger: n});
    },
  X = Ue;
var J = X,
  Be = J(),
  Dt = J(!0),
  Wt = Be;
export {Wt as default, J as startApp, Be as startServer, Dt as startStatic};
