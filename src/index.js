var pe = Object.defineProperty;
var ue = (e, t, r) => () => {
  if (r) throw r[0];
  try {
    return (e && (t = e((e = 0))), t);
  } catch (o) {
    throw ((r = [o]), o);
  }
};
var fe = (e, t) => {
  for (var r in t) pe(e, r, {get: t[r], enumerable: !0});
};
var Q = {};
fe(Q, {basicAuthMiddleware: () => Je});
import {timingSafeEqual as J} from 'node:crypto';
var Xe,
  Ve,
  Je,
  Y = ue(() => {
    ((Xe = (e, t) => {
      let r = Buffer.from(e ?? '', 'utf8'),
        o = Buffer.from(t ?? '', 'utf8');
      return r.length !== o.length ? (J(r, Buffer.alloc(r.length)), !1) : J(r, o);
    }),
      (Ve = e => {
        if (!e?.startsWith('Basic ')) return null;
        let t = Buffer.from(e.slice(6), 'base64').toString('utf8'),
          r = t.indexOf(':');
        return r === -1 ? null : {username: t.slice(0, r), password: t.slice(r + 1)};
      }),
      (Je = ({realm: e = 'Restricted', users: t, authorize: r, skip: o, unauthorizedResponse: s} = {}) => {
        let n = l =>
            typeof o == 'function' ? o(l)
            : o instanceof RegExp ? o.test(l.path)
            : Array.isArray(o) ? o.includes(l.path)
            : !1,
          i = (l, m, a) => {
            if (typeof r == 'function') return r(l, m, a);
            if (t) {
              let c = t[l];
              return c !== void 0 && Xe(m, c);
            }
            return !1;
          },
          d = (l, m) => {
            l.set('WWW-Authenticate', `Basic realm="${e}", charset="UTF-8"`);
            let a = typeof s == 'function' ? s(m) : void 0;
            l.status(401).send(a);
          };
        return async (l, m, a) => {
          if (n(l)) return a();
          let c = l.headers['proxy-authorization'] || l.headers.authorization,
            p = Ve(c);
          if (!p) return d(m, l);
          try {
            if (!(await i(p.username, p.password, l))) return d(m, l);
            ((l.basicAuthInfo = {username: p.username}), a());
          } catch {
            m.status(500).end();
          }
        };
      }));
  });
import b from 'express';
import ze from 'cors';
import {rateLimit as Be, ipKeyGenerator as Ue} from 'express-rate-limit';
import X from 'compression';
import {createServer as V} from 'node:http';
import De from 'node:https';
var M = async (e = {}, t) => {
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
};
import he from 'node:os';
import ge from 'node:net';
var f = (e = new Date()) => e.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  w = e => Object.prototype.toString.call(e).slice(8, -1).toLowerCase(),
  y = e => w(e) === 'object',
  A = e => w(e) === 'function' || w(e) === 'asyncfunction',
  xe = e => {
    let t = e ? 'https' : 'http',
      r = he.networkInterfaces(),
      o = [];
    return (Object.keys(r).map(n => o.push(...r[n])), o.filter(n => n.family === 'IPv4').map(n => n.address));
  },
  ye = e => {
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
  ve = {
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
  be = (e, t, r) => {
    let [o, s] = e.split('.');
    o && s ? (r[o] || (r[o] = {}), (r[o][s] = t)) : (r[o] = t);
  },
  we = e => {
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
  Ae = e =>
    (e || '').length < 2 ? '/'
    : e.endsWith('/') ? e.slice(0, -1)
    : e,
  L = (e = {}, t = ve) => {
    let {env: r} = process;
    Object.keys(t).map(s => {
      let n = r[s] ?? e[s];
      n && be(t[s], n, e);
    });
    let o = {...e, ...ye()};
    return (
      (o.port = o.staticPort || o.port),
      (o.isDev = o.nodeEnv === 'development'),
      (o.basepath = Ae(o.basepath)),
      (o.protocol = 'http'),
      we(o)
    );
  },
  O = e =>
    new Promise(t => {
      let r = ge.createServer();
      (r.once('error', o => {
        (r.close(), t((o.code === 'EADDRINUSE', !1)));
      }),
        r.once('listening', () => {
          (r.close(), t(!0));
        }),
        r.listen(Number(e)));
    }),
  H = (e, t = {}, r) => {
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
  C = (e, {port: t = 3e3, host: r} = {}) =>
    new Promise((o, s) => {
      (e.once('error', s), e.once('listening', () => o(e)), e.listen(t, r));
    }),
  Ee = (e, t = 56) => {
    let r = e.length,
      o = t - r,
      s = ~~(o / 2);
    return `${'-'.repeat(s)}${e}${'-'.repeat(o - s)}`;
  },
  j = (e = {}, t) => {
    let {port: r, host: o, basepath: s, appName: n = 'HuxyServer', protocol: i, serverLogger: d} = e;
    if (typeof d == 'function') return d(e, t);
    let l = o || 'localhost',
      m = xe()
        .filter(a => a !== l)
        .map(a => `${i}://${a}:${r}${s}`);
    (t.info(Ee(n)),
      t.info(`\u{1F680} \u670D\u52A1\u6B63\u5728\u8FD0\u884C: ${i}://${l}:${r}${s}`),
      t.info(`-----------------[${f()}]------------------`),
      t.info({ips: m}, '\u672C\u5730\u5730\u5740'));
  };
var k = (e, t) => (r, o, s) => {
    (t.error(
      {
        message: 'Not Found',
        timestamp: f(),
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
          timestamp: f(),
        }));
  },
  _ = (e, t) => (r, o, s, n) => {
    let i = r.status || 500,
      d = r.message,
      l = '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF';
    (t.error(
      {
        message: d,
        timestamp: f(),
        stack: r.stack,
        url: o.originalUrl,
        method: o.method,
        ip: o.ip,
        userAgent: o.get('User-Agent'),
      },
      l,
    ),
      s.status(i).json({success: !1, message: e.isDev ? d : l, stack: e.isDev ? r.stack : void 0, timestamp: f()}));
  };
import {fileURLToPath as Se} from 'node:url';
import {dirname as $e, resolve as Pe} from 'node:path';
var E =
  (e = import.meta.url) =>
  (...t) =>
    Pe($e(Se(e)), ...t);
var Ie = E(import.meta.url),
  R = (e, {basepath: t, buildPath: r} = {}) => {
    t !== '/' &&
      e.get(t, (s, n, i) => {
        n.redirect(308, `${t}/${s.search ?? ''}`);
      });
    let o = t === '/' ? t : `${t}/`;
    e.get(`${o}{*splat}`, (s, n, i) => {
      if (n.headersSent) return i();
      n.sendFile(Ie(r, 'index.html'));
    });
  };
import {createProxyMiddleware as He} from 'http-proxy-middleware';
import Te from 'jsonwebtoken';
var N = (e, {secret: t = '', ...r} = {}) => Te.verify(e, t, r);
var z =
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
      let i = N(n, e);
      (t.log.info(i, '\u8BA4\u8BC1\u6210\u529F'), (t.user = i), o());
    } catch (i) {
      let d = i.type || i.name;
      return (
        d === 'TokenExpiredError' ?
          (t.log.error({ip: t.ip}, '\u8BA4\u8BC1\u5931\u8D25: \u4EE4\u724C\u5DF2\u8FC7\u671F'),
          r.status(401).json({message: '\u4EE4\u724C\u5DF2\u8FC7\u671F'}))
        : d === 'JsonWebTokenError' ?
          (t.log.error({ip: t.ip}, '\u8BA4\u8BC1\u5931\u8D25: \u65E0\u6548\u7684\u4EE4\u724C'),
          r.status(403).json({message: '\u65E0\u6548\u7684\u4EE4\u724C'}))
        : d === 'AuthorizationError' ?
          (t.log.error({ip: t.ip}, `\u8BA4\u8BC1\u5931\u8D25: ${i.message}`),
          r.status(i.status).json({message: i.message}))
        : (t.log.error({err: i, ip: t.ip}, '\u8BA4\u8BC1\u5931\u8D25: \u5185\u90E8\u670D\u52A1\u5668\u9519\u8BEF'),
          r.status(500).json({message: '\u5185\u90E8\u670D\u52A1\u5668\u9519\u8BEF'}))
      );
    }
  };
var Me = e =>
    y(e) ? [e]
    : Array.isArray(e) ? e
    : [],
  B = ({proxys: e = [], apiPrefix: t = '/'} = {}) =>
    Me(e).map(r => ((r.prefix = `${t}${r.prefix ?? (r.name ? `/${r.name}` : '')}`.replace('//', '/')), r)),
  U = e => (Array.isArray(e) ? e : []).filter(Boolean),
  D = (e, t) =>
    [...new Set(['/', '/health', t, ...(Array.isArray(e) ? e : [])])]
      .filter(Boolean)
      .map(r => `${t}${r}`.replace('//', '/'));
var F =
  (e = {}) =>
  (t, r, o) => {
    if (t.method === 'OPTIONS') return o();
    let s = U(e.whiteAuthKeys);
    if (D(e.whitePathList, e.apiPrefix).includes(t.path)) return o();
    let {authToken: i, jwtConfig: d} = e;
    if (typeof i == 'string' && i.length > 0 && i !== 'false') {
      let m = t.headers,
        a = m['x-huxy-auth'] || m['x-api-key'] || m.authorization || '',
        c = t.query.token || a.split('Bearer ')[1];
      return (c && c === i) || s.includes(c) ?
          o()
        : (t.log.error('\u8BA4\u8BC1\u5931\u8D25: \u65E0\u6548\u7684\u4EE4\u724C'),
          r.status(403).json({message: '\u65E0\u6548\u7684\u4EE4\u724C'}));
    }
    if (y(d)) return z({secret, expiresIn, algorithm, issuer})(t, r, o);
    o();
  };
var Le = [
    'origin',
    'referer',
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'cf-ipcountry',
    'cf-ray',
    'x-huxy-auth',
  ],
  Oe = ['x-powered-by', 'server'],
  S = (e, t) => {
    (Le.forEach(r => e.removeHeader(r)), e.setHeader('Host', t), e.setHeader('User-Agent', 'IHUXY-API/1.0'));
  },
  W = e => {
    (Oe.forEach(t => e.removeHeader(t)),
      e.setHeader('Access-Control-Allow-Origin', '*'),
      e.setHeader('X-Content-Type-Options', 'nosniff'),
      e.getHeader('content-type')?.includes('text/event-stream') &&
        ((e.headers['Cache-Control'] = 'no-cache, no-transform'),
        (e.headers.Connection = 'keep-alive'),
        (e.headers['X-Accel-Buffering'] = 'no')));
  };
var Ce = (e, t = '/') => {
    let r = {
      status: 'OK',
      message: `API \u670D\u52A1\u5668\u8FD0\u884C\u4E2D \u{1F449} ${t}`,
      timestamp: f(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
    e.get(`${t}/health`.replace('//', '/'), (o, s) => {
      s.status(200).json(r);
    });
  },
  je = ({target: e = 'http://', prefix: t, withPrefix: r, preserve: o = !1, ...s} = {}) => ({
    target: e,
    changeOrigin: !0,
    secure: !1,
    xfwd: !0,
    ws: !0,
    on: {
      proxyReq: (n, i, d) => {
        n.removeHeader && !o && S(n, e);
      },
      proxyReqWs: (n, i, d) => {
        n.removeHeader && !o && S(n, e);
      },
      proxyRes: (n, i, d) => {
        n.removeHeader && !o && W(n);
      },
      error: (n, i, d) => {
        let l = i.headers.upgrade?.toLowerCase() === 'websocket',
          m = i.url.includes('/socket.io') || i.url.includes('EIO=');
        !l && !m && (d.headersSent || d.status(502).json({error: '\u7F51\u5173\u9519\u8BEF'}));
      },
    },
    ...s,
  }),
  ke = (e, t) => {
    t?.length &&
      e.on('upgrade', (r, o, s) => {
        t.map(n => n.upgrade(r, o, s));
      });
  },
  _e = (e, t = {}, r, o) => {
    let {apiPrefix: s = '/', proxys: n = []} = t;
    r.info(`\u{1F4DD} API \u63A5\u53E3\u5730\u5740: ${t.protocol}://${t.host ?? 'localhost'}:${t.port}${s}`);
    let i = [];
    (n.map(({prefix: d, target: l, withPrefix: m = !0, ...a}) => {
      l = m ? `${l}${d}` : l;
      let c = He(je({prefix: d, target: l, withPrefix: m, ...a}));
      (e.use(d, F(t), c), r.info(`\u2705 \u4EE3\u7406\u4E2D ${d} \u{1F449} ${l}`), i.push(c));
    }),
      ke(o, i),
      Ce(e, s));
  },
  G = _e;
import {Router as Re} from 'express';
var K = e => {
  let t = Re();
  return (
    t.use('/health', (r, o) => {
      o.status(200).json({
        status: 'OK',
        timestamp: f(),
        environment: e.nodeEnv,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        pid: process.pid,
      });
    }),
    t.get('/', (r, o) => {
      o.status(200).json({
        message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D',
        timestamp: f(),
        environment: e.nodeEnv,
      });
    }),
    t
  );
};
var Ne = {
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
  Z = Ne;
var Fe = async (e, t = {}, r) => {
    if ((e.disable('x-powered-by'), e.set('trust proxy', t.trustProxy ?? !0), r.isPino)) {
      let s = (await import('pino-http')).default;
      e.use(s({logger: r, quietReqLogger: !0, autoLogging: !1, genReqId: !1}));
    } else
      e.use((s, n, i) => {
        ((s.log = r), i());
      });
    e.use(ze(t.cors));
    let {helmet: o} = t;
    if (o) {
      let s = (await import('helmet')).default;
      e.use(s(y(o) ? o : void 0));
    }
    e.use(X({filter: (s, n) => (n.getHeader('Content-Type') === 'text/event-stream' ? !1 : X.filter(s, n))}));
  },
  We = (e, t = {}) => {
    e.use(
      t.basepath,
      b.static(t.buildPath, {
        immutable: !0,
        maxAge: '1y',
        setHeaders: (r, o) => {
          o.endsWith('.html') && r.setHeader('Cache-Control', 'no-cache, must-revalidate');
        },
        ...t.staticCache,
      }),
    );
  },
  Ge = (e, t = {}, r, o) => {
    e.use(
      t.apiPrefix,
      Be({
        keyGenerator: n => Ue(n.ip) || n.headers['x-huxy-auth'] || n.headers['x-api-key'] || n.headers.authorization,
        ...t.rateLimit,
      }),
    );
    let s = B(t);
    (s.length && G(e, {...t, proxys: s}, r, o),
      e.use(b.json({limit: '20mb'})),
      e.use(b.urlencoded({extended: !0, limit: '20mb'})));
  },
  Ke = (e, t = {}, r, o) => {
    (o && R(e, t), e.use(K(t)), e.use(k(t, r)), e.use(_(t, r)));
  },
  Ze = async (e = {}, t, r, o) => {
    let {logger: s, ...n} = L({...Z, ...e}),
      i = s ?? (await M(n.loggerConfig, n.nodeEnv)),
      {port: d, ssl: l} = n;
    (await O(d)) ||
      ((n.port = Number(d) + 1),
      i.warn(`\u7AEF\u53E3 ${d} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${n.port}`));
    let a = b();
    await Fe(a, n, i);
    let c;
    l ?
      (y(l) ||
        (i.error(
          {ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}},
          '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}',
        ),
        process.exit(1)),
      (n.protocol = 'https'),
      (c = De.createServer(l, a)),
      V((h, T) => {
        (T.writeHead(301, {Location: `${n.protocol}://${h.headers.host}${h.url}`}), T.end());
      }).listen(80))
    : (c = V(a));
    let {cors: p, helmet: x, rateLimit: v, jwtConfig: I, ...u} = n;
    if (A(r))
      try {
        await r(u, a, c, i);
      } catch (h) {
        (i.error({err: h}, `\u274C \u94A9\u5B50\u51FD\u6570\u9519\u8BEF\uFF1A${h.message}`), process.exit(1));
      }
    if ((o && We(a, u), Ge(a, n, i, c), A(t)))
      try {
        await t(u, a, c, i);
      } catch (h) {
        (i.error({err: h}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${h.message}`), process.exit(1));
      }
    Ke(a, u, i, o);
    try {
      (await C(c, u), j(u, i));
    } catch (h) {
      (i.error({err: h}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25\uFF01'), process.exit(1));
    }
    return (H(c, u, i), {config: u, app: a, httpServer: c, logger: i});
  },
  $ = Ze;
var Qe = async (e, t) => {
  let {basicAuthMiddleware: r} = await Promise.resolve().then(() => (Y(), Q));
  t.use(
    r({
      realm: 'Restricted',
      unauthorizedResponse: o => ({message: '\u672A\u6388\u6743\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\uFF01'}),
      users: {admin: '123456'},
      ...e,
    }),
  );
};
import {urlencoded as ot, Router as st} from 'express';
import Ye from 'express-session';
var qe = 1440 * 60 * 1e3,
  q = ({cookie: e, maxAge: t, ...r} = {}) =>
    Ye({
      secret: '',
      resave: !1,
      saveUninitialized: !1,
      cookie: {httpOnly: !0, sameSite: 'lax', maxAge: (Number(t) || 30) * qe, ...e},
      ...r,
    }),
  ee = e => (t, r, o) =>
    t.session?.authorized ? o()
    : t.accepts(['html', 'json']) === 'json' ? r.status(401).json({error: '\u672A\u6388\u6743', redirect: `${e}/email`})
    : r.redirect(`${e}/email`),
  te =
    (e = '_flash') =>
    (t, r, o) => {
      if (!t.session)
        return o(new Error('flashMiddleware: express-session is required and must be mounted before flash'));
      ((t.session[e] = t.session[e] || {}),
        (t.flash = (s, n) => {
          if (s === void 0) {
            let i = t.session[e];
            return ((t.session[e] = {}), i);
          }
          if (n === void 0) {
            let i = t.session[e][s];
            return (delete t.session[e][s], i ?? '');
          }
          t.session[e][s] = n;
        }),
        o());
    };
var re =
    ({mailCfg: e, codeCfg: t} = {}) =>
    async ({email: r, code: o, ...s}) => {
      let {from: n, subject: i, ...d} = e ?? {},
        m = (await import('nodemailer')).default.createTransport(d),
        {ttl: a} = t ?? {};
      await m.sendMail({
        from: n,
        to: r,
        subject: i,
        text: `\u60A8\u7684\u9A8C\u8BC1\u7801\u662F ${o}\uFF0C\u6709\u6548\u671F ${Math.floor(a / 6e4)} \u5206\u949F\u3002\u5982\u975E\u672C\u4EBA\u64CD\u4F5C\u8BF7\u5FFD\u7565\u3002`,
        html: `<p>\u60A8\u7684\u9A8C\u8BC1\u7801\u662F <b>${o}</b>\uFF0C\u6709\u6548\u671F ${Math.floor(a / 6e4)} \u5206\u949F\u3002</p>`,
        ...s,
      });
    },
  oe = ({CODE_LENGTH: e = 6} = {}) => String(Math.floor(Math.random() * 10 ** e)).padStart(e, '0');
var se = e => {
  let t = new Map();
  return {
    set: (r, o) => {
      t.set(r.toLowerCase(), {code: o, expiresAt: Date.now() + e.ttl, attempts: 0});
    },
    get: r => t.get(r.toLowerCase()) || null,
    delete: r => {
      t.delete(r.toLowerCase());
    },
    isExpired: r => !r || r.expiresAt < Date.now(),
  };
};
var P = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 606" width="100%" height="100%" aria-label="Ihuxy" role="img">
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
var ne = `
:root {
  --cf: #f6821f;
  --cf-hover: #e07317;
  --cf-ring: rgba(246,130,31,.15);
  --g50: #f8f9fa; --g200: #e9ecef; --g300: #dee2e6;
  --g500: #adb5bd; --g600: #6c757d; --g900: #212529;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font:15px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--g50);color:var(--g900);min-height:100vh;display:grid;place-items:center;padding:1rem}
.card{background:#fff;border:1px solid var(--g200);border-radius:12px;padding:clamp(1.5rem,5vw,2.5rem);width:100%;max-width:380px;box-shadow:0 1px 3px rgba(0,0,0,.05),0 4px 16px rgba(0,0,0,.04)}
.logo{width:52px;height:58px;margin:0 auto;display:grid;place-items:center}
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
.footer{text-align:center;margin-top:1.5rem;font-size:.6875rem;color:var(--g500)}
.err{background:#fef3cd;border:1px solid #ffc107;color:#856404;padding:.5625rem .75rem;border-radius:6px;font-size:.8125rem;margin-bottom:1rem}
.links{display:flex;justify-content:space-between;margin-top:1rem}
.links a{color:var(--cf);font-size:.8125rem;text-decoration:none}
.links a:hover{text-decoration:underline}
.code-input{width:100%;padding:.5rem .75rem;text-align:center;font-size:1.5rem;letter-spacing:.6rem;border:1px solid var(--g300);border-radius:6px;transition:border-color .15s,box-shadow .15s}
.code-input:focus{outline:none;border-color:var(--cf);box-shadow:0 0 0 3px var(--cf-ring)}
`,
  ie = (
    e,
    {title: t, tips: r, footer: o, logo: s} = {},
    n,
  ) => `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in \xB7 Access</title><style>${ne}</style></head><body>
<div class="card">
  <div class="logo">${s ?? P}</div>
  <h1>\u767B\u5F55</h1>
  <p class="team">${t ?? ''}</p>
  <p class="desc">${r ?? ''}</p>
  ${e ? `<div class="err">${e}</div>` : ''}
  <form method="post" action="${n}/email" id="emailForm">
    <input class="input" type="email" name="email" placeholder="name@ihuxy.com" required autofocus autocomplete="email">
    <button class="btn" type="submit" id="submitBtn">Send code</button>
  </form>
  <p class="footer">${o ?? ''}</p>
</div>
<script>
document.getElementById('emailForm').addEventListener('submit', function() {
  var btn = document.getElementById('submitBtn');
  btn.classList.add('loading');
  btn.disabled = true;
});
</script>
</body></html>`,
  ae = (
    e,
    t,
    {logo: r} = {},
    o,
    {ttl: s = 3e5} = {},
  ) => `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verify \xB7 Access</title><style>${ne}</style></head><body>
<div class="card">
  <div class="logo">${r ?? P}</div>
  <h1>\u8F93\u5165\u9A8C\u8BC1\u7801</h1>
  <p class="team">\u5DF2\u5411 <strong style="color:var(--g900)">${e}</strong> \u53D1\u9001\u4E86\u9A8C\u8BC1\u7801</p>
  <p class="desc">\u6709\u6548\u671F <strong style="color:var(--cf)">${Math.floor(s / 6e4)}</strong> \u5206\u949F</p>
  ${t ? `<div class="err">${t}</div>` : ''}
  <form method="post" action="${o}/code" id="codeForm">
    <input class="code-input" type="text" name="code" inputmode="numeric" pattern="[0-9]*" maxlength="6" required autofocus autocomplete="one-time-code">
    <button class="btn" type="submit" id="verifyBtn">\u9A8C\u8BC1</button>
  </form>
  <div class="links">
    <a href="${o}/email" id="a1">\u66F4\u6539\u90AE\u7BB1</a>
    <a href="${o}/email" id="a2">\u91CD\u65B0\u53D1\u9001</a>
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
</body></html>`;
var et = /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  tt =
    e =>
    (t, r, o, s = 'email') => {
      (t.flash('error', o), r.redirect(`${e}/${s}`));
    },
  ce = ({code: e, mail: t, allowedEmails: r, page: o, authpath: s} = {}, n) => {
    let i = n(),
      d = se(e),
      l = re({mailCfg: t, codeCfg: e}),
      m = tt(s);
    return (
      i.get('/email', (a, c) => {
        if (a.session.authorized) return c.redirect('/');
        c.type('html').send(ie(a.flash('error'), o, s));
      }),
      i.post('/email', async (a, c) => {
        let {email: p} = a.body;
        if (!et.test(p)) return m(a, c, '\u90AE\u7BB1\u683C\u5F0F\u4E0D\u6B63\u786E');
        if (!r?.has(p)) return m(a, c, '\u8BE5\u90AE\u7BB1\u65E0\u8BBF\u95EE\u6743\u9650');
        let x = oe();
        d.set(p, x);
        try {
          await l({email: p, code: x});
        } catch {
          return m(a, c, '\u9A8C\u8BC1\u7801\u53D1\u9001\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5');
        }
        ((a.session.pendingEmail = p), await new Promise(v => a.session.save(v)), c.redirect(`${s}/code`));
      }),
      i.get('/code', (a, c) => {
        if (!a.session.pendingEmail)
          return m(a, c, '\u8BF7\u5148\u8F93\u5165\u90AE\u7BB1\u83B7\u53D6\u9A8C\u8BC1\u7801');
        if (a.session.authorized) return c.redirect('/');
        c.type('html').send(ae(a.session.pendingEmail, a.flash('error'), o, s, e));
      }),
      i.post('/code', async (a, c) => {
        let p = a.session.pendingEmail;
        if (!p) return m(a, c, '\u4F1A\u8BDD\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u83B7\u53D6\u9A8C\u8BC1\u7801');
        let x = d.get(p);
        if (d.isExpired(x))
          return (d.delete(p), m(a, c, '\u9A8C\u8BC1\u7801\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u83B7\u53D6'));
        if ((x.attempts++, x.attempts > e.maxAttempts))
          return (
            d.delete(p),
            m(a, c, '\u5C1D\u8BD5\u6B21\u6570\u8FC7\u591A\uFF0C\u8BF7\u91CD\u65B0\u83B7\u53D6\u9A8C\u8BC1\u7801')
          );
        if (x.code !== a.body.code) return m(a, c, '\u9A8C\u8BC1\u7801\u9519\u8BEF', 'code');
        (d.delete(p),
          await new Promise((v, I) => {
            a.session.regenerate(u => {
              if (u) return I(u);
              ((a.session.authorized = !0), (a.session.email = p), v());
            });
          }),
          c.redirect('/'));
      }),
      i.get('/logout', (a, c) => {
        a.session.destroy(() => c.redirect(`${s}/email`));
      }),
      i
    );
  };
var le = e => Object.prototype.toString.call(e).slice(8, -1).toLowerCase(),
  de = e =>
    e ?
      le(e) === 'set' ? e
      : le(e) === 'array' ? new Set(e)
      : new Set(
          e
            .replaceAll(
              ',',
              `
`,
            )
            .split(
              `
`,
            )
            .map(t => t.trim().toLowerCase())
            .filter(Boolean),
        )
    : null;
var g = (e, t) => process.env[e] ?? t,
  rt = {
    session: {secret: g('SESSION_SECRET', ''), maxAge: Number(g('SESSION_COOKIE_MAXAGE', 30))},
    code: {
      ttl: Number(g('CODE_TTL_MS', 3e5)),
      len: Number(g('CODE_LENGTH', 6)),
      maxAttempts: Number(g('CODE_MAX_ATTEMPTS', 5)),
    },
    mail: {
      host: g('MAIL_HOST', ''),
      port: Number(g('MAIL_PORT', 587)),
      auth: JSON.parse(g('MAIL_AUTH', '{}')),
      from: g('MAIL_FROM'),
    },
    allowedEmails: g('ALLOWED_EMAILS'),
    authpath: '/authCode',
  },
  me = e => {
    let t = {...rt, ...e};
    if (((t.allowedEmails = de(t.allowedEmails)), !t.session?.secret))
      throw new Error('\u8BF7\u914D\u7F6E [session.secret] \uFF01');
    if (!t.mail?.host || !t.mail?.auth)
      throw new Error(
        '\u8BF7\u5B8C\u5584\u90AE\u7BB1\u914D\u7F6E\uFF0C\u5982 [mail.auth] \u7B49\uFF0C\u53C2\u7167 [nodemailer] \u914D\u7F6E\u3002',
      );
    if (!t.allowedEmails?.size)
      throw new Error('\u8BF7\u914D\u7F6E\u56E2\u961F\u8BBF\u95EE\u8005\u90AE\u7BB1 [allowedEmails] \uFF01');
    return t;
  };
var nt = (e, t) => {
  let r = me(e);
  (t.use(q(r.session), te()), t.use(r.authpath, ot({extended: !0}), ce(r, st)), t.use(ee(r.authpath)));
};
var it = (e, t, r) => $(e, t, r),
  Sr = (e, t, r) => $(e, t, r, !0),
  $r = it;
export {Qe as basicAuth, nt as codeAuth, $r as default, E as resolvePath, it as startServer, Sr as startStatic};
