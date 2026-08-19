import g from 'express';
import fe from 'cors';
import {rateLimit as he, ipKeyGenerator as ge} from 'express-rate-limit';
import G from 'compression';
import {createServer as F} from 'node:http';
import xe from 'node:https';
var P = async (e = {}, t) => {
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
import K from 'node:os';
import z from 'node:net';
var u = (e = new Date()) => e.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  x = e => Object.prototype.toString.call(e).slice(8, -1).toLowerCase(),
  h = e => x(e) === 'object',
  y = e => x(e) === 'function' || x(e) === 'asyncfunction',
  B = e => {
    let t = e ? 'https' : 'http',
      r = K.networkInterfaces(),
      o = [];
    return (Object.keys(r).map(n => o.push(...r[n])), o.filter(n => n.family === 'IPv4').map(n => n.address));
  },
  X = e => {
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
  V = {
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
  J = (e, t, r) => {
    let [o, s] = e.split('.');
    o && s ? (r[o] || (r[o] = {}), (r[o][s] = t)) : (r[o] = t);
  },
  Q = e => {
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
  Y = e =>
    (e || '').length < 2 ? '/'
    : e.endsWith('/') ? e.slice(0, -1)
    : e,
  S = (e = {}, t = V) => {
    let {env: r} = process;
    Object.keys(t).map(s => {
      let n = r[s] ?? e[s];
      n && J(t[s], n, e);
    });
    let o = {...e, ...X()};
    return (
      (o.port = o.staticPort || o.port),
      (o.isDev = o.nodeEnv === 'development'),
      (o.basepath = Y(o.basepath)),
      (o.protocol = 'http'),
      Q(o)
    );
  },
  T = e =>
    new Promise(t => {
      let r = z.createServer();
      (r.once('error', o => {
        (r.close(), t((o.code === 'EADDRINUSE', !1)));
      }),
        r.once('listening', () => {
          (r.close(), t(!0));
        }),
        r.listen(Number(e)));
    }),
  E = (e, t = {}, r) => {
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
  $ = (e, {port: t = 3e3, host: r} = {}) =>
    new Promise((o, s) => {
      (e.once('error', s), e.once('listening', () => o(e)), e.listen(t, r));
    }),
  Z = (e, t = 56) => {
    let r = e.length,
      o = t - r,
      s = ~~(o / 2);
    return `${'-'.repeat(s)}${e}${'-'.repeat(o - s)}`;
  },
  I = (e = {}, t) => {
    let {port: r, host: o, basepath: s, appName: n = 'HuxyServer', protocol: i, serverLogger: a} = e;
    if (typeof a == 'function') return a(e, t);
    let c = o || 'localhost',
      l = B()
        .filter(p => p !== c)
        .map(p => `${i}://${p}:${r}${s}`);
    (t.info(Z(n)),
      t.info(`\u{1F680} \u670D\u52A1\u6B63\u5728\u8FD0\u884C: ${i}://${c}:${r}${s}`),
      t.info(`-----------------[${u()}]------------------`),
      t.info({ips: l}, '\u672C\u5730\u5730\u5740'));
  };
var H = (e, t) => (r, o, s) => {
    (t.error(
      {
        message: 'Not Found',
        timestamp: u(),
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
          timestamp: u(),
        }));
  },
  k = (e, t) => (r, o, s, n) => {
    let i = r.status || 500,
      a = r.message,
      c = '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF';
    (t.error(
      {
        message: a,
        timestamp: u(),
        stack: r.stack,
        url: o.originalUrl,
        method: o.method,
        ip: o.ip,
        userAgent: o.get('User-Agent'),
      },
      c,
    ),
      s.status(i).json({success: !1, message: e.isDev ? a : c, stack: e.isDev ? r.stack : void 0, timestamp: u()}));
  };
import {fileURLToPath as q} from 'node:url';
import {dirname as ee, resolve as te} from 'node:path';
var j =
  (e = import.meta.url) =>
  (...t) =>
    te(ee(q(e)), ...t);
var re = j(import.meta.url),
  O = (e, {basepath: t, buildPath: r} = {}) => {
    t !== '/' &&
      e.get(t, (s, n, i) => {
        n.redirect(308, `${t}/${s.search ?? ''}`);
      });
    let o = t === '/' ? t : `${t}/`;
    e.get(`${o}{*splat}`, (s, n, i) => {
      if (n.headersSent) return i();
      n.sendFile(re(r, 'index.html'));
    });
  };
import {createProxyMiddleware as ae} from 'http-proxy-middleware';
import oe from 'jsonwebtoken';
var L = (e, {secret: t = '', ...r} = {}) => oe.verify(e, t, r);
var b =
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
      let i = L(n, e);
      (t.log.info(i, '\u8BA4\u8BC1\u6210\u529F'), (t.user = i), o());
    } catch (i) {
      let a = i.type || i.name;
      return (
        a === 'TokenExpiredError' ?
          (t.log.error({ip: t.ip}, '\u8BA4\u8BC1\u5931\u8D25: \u4EE4\u724C\u5DF2\u8FC7\u671F'),
          r.status(401).json({message: '\u4EE4\u724C\u5DF2\u8FC7\u671F'}))
        : a === 'JsonWebTokenError' ?
          (t.log.error({ip: t.ip}, '\u8BA4\u8BC1\u5931\u8D25: \u65E0\u6548\u7684\u4EE4\u724C'),
          r.status(403).json({message: '\u65E0\u6548\u7684\u4EE4\u724C'}))
        : a === 'AuthorizationError' ?
          (t.log.error({ip: t.ip}, `\u8BA4\u8BC1\u5931\u8D25: ${i.message}`),
          r.status(i.status).json({message: i.message}))
        : (t.log.error({err: i, ip: t.ip}, '\u8BA4\u8BC1\u5931\u8D25: \u5185\u90E8\u670D\u52A1\u5668\u9519\u8BEF'),
          r.status(500).json({message: '\u5185\u90E8\u670D\u52A1\u5668\u9519\u8BEF'}))
      );
    }
  };
var se = e =>
    h(e) ? [e]
    : Array.isArray(e) ? e
    : [],
  R = ({proxys: e = [], apiPrefix: t = '/'} = {}) =>
    se(e).map(r => ((r.prefix = `${t}${r.prefix ?? (r.name ? `/${r.name}` : '')}`.replace('//', '/')), r)),
  _ = e => (Array.isArray(e) ? e : []).filter(Boolean),
  C = (e, t) =>
    [...new Set(['/', '/health', t, ...(Array.isArray(e) ? e : [])])]
      .filter(Boolean)
      .map(r => `${t}${r}`.replace('//', '/'));
var M =
  (e = {}) =>
  (t, r, o) => {
    if (t.method === 'OPTIONS') return o();
    let s = _(e.whiteAuthKeys);
    if (C(e.whitePathList, e.apiPrefix).includes(t.path)) return o();
    let {authToken: i, jwtConfig: a} = e;
    if (typeof i == 'string' && i.length > 0 && i !== 'false') {
      let l = t.headers,
        p = l['x-huxy-auth'] || l['x-api-key'] || l.authorization || '',
        m = t.query.token || p.split('Bearer ')[1];
      return (m && m === i) || s.includes(m) ?
          o()
        : (t.log.error('\u8BA4\u8BC1\u5931\u8D25: \u65E0\u6548\u7684\u4EE4\u724C'),
          r.status(403).json({message: '\u65E0\u6548\u7684\u4EE4\u724C'}));
    }
    if (h(a)) return b({secret, expiresIn, algorithm, issuer})(t, r, o);
    o();
  };
var ne = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip', 'cf-ipcountry', 'cf-ray', 'x-huxy-auth'],
  ie = ['x-powered-by', 'server'],
  v = (e, t) => {
    (ne.forEach(r => e.removeHeader(r)), e.setHeader('Origin', t), e.setHeader('User-Agent', 'IHUXY-API/1.0'));
  },
  N = e => {
    (ie.forEach(t => e.removeHeader(t)),
      e.setHeader('Access-Control-Allow-Origin', '*'),
      e.setHeader('X-Content-Type-Options', 'nosniff'),
      e.getHeader('content-type')?.includes('text/event-stream') &&
        ((e.headers['Cache-Control'] = 'no-cache, no-transform'),
        (e.headers.Connection = 'keep-alive'),
        (e.headers['X-Accel-Buffering'] = 'no')));
  };
var ce = (e, t = '/') => {
    let r = {
      status: 'OK',
      message: `API \u670D\u52A1\u5668\u8FD0\u884C\u4E2D \u{1F449} ${t}`,
      timestamp: u(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
    e.get(`${t}/health`.replace('//', '/'), (o, s) => {
      s.status(200).json(r);
    });
  },
  pe = ({target: e = 'http://', prefix: t, withPrefix: r, preserve: o = !1, ...s} = {}) => ({
    target: e,
    changeOrigin: !0,
    secure: !1,
    xfwd: !0,
    ws: !0,
    on: {
      proxyReq: (n, i, a) => {
        n.removeHeader && !o && v(n, e);
      },
      proxyReqWs: (n, i, a) => {
        n.removeHeader && !o && v(n, e);
      },
      proxyRes: (n, i, a) => {
        n.removeHeader && !o && N(n);
      },
      error: (n, i, a) => {
        let c = i.headers.upgrade?.toLowerCase() === 'websocket',
          l = i.url.includes('/socket.io') || i.url.includes('EIO=');
        !c && !l && (a.headersSent || a.status(502).json({error: '\u7F51\u5173\u9519\u8BEF'}));
      },
    },
    ...s,
  }),
  me = (e, t) => {
    t?.length &&
      e.on('upgrade', (r, o, s) => {
        t.map(n => n.upgrade(r, o, s));
      });
  },
  le = (e, t = {}, r, o) => {
    let {apiPrefix: s = '/', proxys: n = []} = t;
    r.info(`\u{1F4DD} API \u63A5\u53E3\u5730\u5740: ${t.protocol}://${t.host ?? 'localhost'}:${t.port}${s}`);
    let i = [];
    (n.map(({prefix: a, target: c, withPrefix: l = !0, ...p}) => {
      c = l ? `${c}${a}` : c;
      let m = ae(pe({prefix: a, target: c, withPrefix: l, ...p}));
      (e.use(a, M(t), m), r.info(`\u2705 \u4EE3\u7406\u4E2D ${a} \u{1F449} ${c}`), i.push(m));
    }),
      me(o, i),
      ce(e, s));
  },
  U = le;
import {Router as ue} from 'express';
var D = e => {
  let t = ue();
  return (
    t.use('/health', (r, o) => {
      o.status(200).json({
        status: 'OK',
        timestamp: u(),
        environment: e.nodeEnv,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        pid: process.pid,
      });
    }),
    t.get('/', (r, o) => {
      o.status(200).json({
        message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D',
        timestamp: u(),
        environment: e.nodeEnv,
      });
    }),
    t
  );
};
var de = {
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
  W = de;
var ye = async (e, t = {}, r) => {
    if ((e.disable('x-powered-by'), e.set('trust proxy', t.trustProxy ?? !0), r.isPino)) {
      let s = (await import('pino-http')).default;
      e.use(s({logger: r, quietReqLogger: !0, autoLogging: !1, genReqId: !1}));
    } else
      e.use((s, n, i) => {
        ((s.log = r), i());
      });
    e.use(fe(t.cors));
    let {helmet: o} = t;
    if (o) {
      let s = (await import('helmet')).default;
      e.use(s(h(o) ? o : void 0));
    }
    e.use(G({filter: (s, n) => (n.getHeader('Content-Type') === 'text/event-stream' ? !1 : G.filter(s, n))}));
  },
  ve = (e, t = {}) => {
    e.use(
      t.basepath,
      g.static(t.buildPath, {
        immutable: !0,
        maxAge: '1y',
        setHeaders: (r, o) => {
          o.endsWith('.html') && r.setHeader('Cache-Control', 'no-cache, must-revalidate');
        },
        ...t.staticCache,
      }),
    );
  },
  we = (e, t = {}, r, o) => {
    e.use(
      t.apiPrefix,
      he({
        keyGenerator: n => ge(n.ip) || n.headers['x-huxy-auth'] || n.headers['x-api-key'] || n.headers.authorization,
        ...t.rateLimit,
      }),
    );
    let s = R(t);
    (s.length && U(e, {...t, proxys: s}, r, o),
      e.use(g.json({limit: '20mb'})),
      e.use(g.urlencoded({extended: !0, limit: '20mb'})));
  },
  Ae = (e, t = {}, r, o) => {
    (o && O(e, t), e.use(D(t)), e.use(H(t, r)), e.use(k(t, r)));
  },
  Pe = async (e = {}, t, r, o) => {
    let {logger: s, ...n} = S({...W, ...e}),
      i = s ?? (await P(n.loggerConfig, n.nodeEnv)),
      {port: a, ssl: c} = n;
    (await T(a)) ||
      ((n.port = Number(a) + 1),
      i.warn(`\u7AEF\u53E3 ${a} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${n.port}`));
    let p = g();
    await ye(p, n, i);
    let m;
    c ?
      (h(c) ||
        (i.error(
          {ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}},
          '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}',
        ),
        process.exit(1)),
      (n.protocol = 'https'),
      (m = xe.createServer(c, p)),
      F((d, A) => {
        (A.writeHead(301, {Location: `${n.protocol}://${d.headers.host}${d.url}`}), A.end());
      }).listen(80))
    : (m = F(p));
    let {cors: Te, helmet: Ee, rateLimit: $e, jwtConfig: Ie, ...f} = n;
    if (y(r))
      try {
        await r(f, p, m, i);
      } catch (d) {
        (i.error({err: d}, `\u274C \u94A9\u5B50\u51FD\u6570\u9519\u8BEF\uFF1A${d.message}`), process.exit(1));
      }
    if ((o && ve(p, f), we(p, n, i, m), y(t)))
      try {
        await t(f, p, m, i);
      } catch (d) {
        (i.error({err: d}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${d.message}`), process.exit(1));
      }
    Ae(p, f, i, o);
    try {
      (await $(m, f), I(f, i));
    } catch (d) {
      (i.error({err: d}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25\uFF01'), process.exit(1));
    }
    return (E(m, f, i), {config: f, app: p, httpServer: m, logger: i});
  },
  w = Pe;
var Se = (e, t, r) => w(e, t, r),
  St = (e, t, r) => w(e, t, r, !0),
  Tt = Se;
export {Tt as default, Se as startServer, St as startStatic};
