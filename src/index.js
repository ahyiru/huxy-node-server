import g from 'express';
import ge from 'cors';
import {rateLimit as xe, ipKeyGenerator as ye} from 'express-rate-limit';
import K from 'compression';
import {createServer as z} from 'node:http';
import ve from 'node:https';
var T = async (e = {}, t) => {
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
import B from 'node:os';
import X from 'node:net';
var u = (e = new Date()) => e.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  y = e => Object.prototype.toString.call(e).slice(8, -1).toLowerCase(),
  h = e => y(e) === 'object',
  v = e => y(e) === 'function' || y(e) === 'asyncfunction',
  V = e => {
    let t = e ? 'https' : 'http',
      r = B.networkInterfaces(),
      o = [];
    return (Object.keys(r).map(n => o.push(...r[n])), o.filter(n => n.family === 'IPv4').map(n => n.address));
  },
  J = e => {
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
  Q = {
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
  Y = (e, t, r) => {
    let [o, s] = e.split('.');
    o && s ? (r[o] || (r[o] = {}), (r[o][s] = t)) : (r[o] = t);
  },
  Z = e => {
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
  q = e =>
    (e || '').length < 2 ? '/'
    : e.endsWith('/') ? e.slice(0, -1)
    : e,
  E = (e = {}, t = Q) => {
    let {env: r} = process;
    Object.keys(t).map(s => {
      let n = r[s] ?? e[s];
      n && Y(t[s], n, e);
    });
    let o = {...e, ...J()};
    return (
      (o.port = parseInt(o.staticPort || o.port, 10)),
      (o.isDev = o.nodeEnv === 'development'),
      (o.basepath = q(o.basepath)),
      (o.protocol = 'http'),
      Z(o)
    );
  },
  I = e =>
    new Promise(t => {
      let r = X.createServer();
      (r.once('error', o => {
        (r.close(), t((o.code === 'EADDRINUSE', !1)));
      }),
        r.once('listening', () => {
          (r.close(), t(!0));
        }),
        r.listen(Number(e)));
    }),
  $ = (e, t = {}, r) => {
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
  H = (e, {port: t = 3e3, host: r} = {}) =>
    new Promise((o, s) => {
      (e.once('error', s), e.once('listening', () => o(e)), e.listen(t, r));
    }),
  ee = (e, t = 56) => {
    let r = e.length,
      o = t - r,
      s = ~~(o / 2);
    return `${'-'.repeat(s)}${e}${'-'.repeat(o - s)}`;
  },
  L = (e = {}, t) => {
    let {port: r, host: o, basepath: s, appName: n = 'HuxyServer', protocol: i, serverLogger: a} = e;
    if (typeof a == 'function') return a(e, t);
    if (a === !1) return;
    let p = o || 'localhost',
      l = V()
        .filter(c => c !== p)
        .map(c => `${i}://${c}:${r}${s}`);
    (t.info(ee(n)),
      t.info(`\u{1F680} \u670D\u52A1\u6B63\u5728\u8FD0\u884C: ${i}://${p}:${r}${s}`),
      t.info(`-----------------[${u()}]------------------`),
      t.info({ips: l}, '\u672C\u5730\u5730\u5740'));
  };
var k = (e, t) => (r, o, s) => {
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
  j = (e, t) => (r, o, s, n) => {
    let i = r.status || 500,
      a = r.message,
      p = '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF';
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
      p,
    ),
      s.status(i).json({success: !1, message: e.isDev ? a : p, stack: e.isDev ? r.stack : void 0, timestamp: u()}));
  };
import {fileURLToPath as te} from 'node:url';
import {dirname as re, resolve as oe} from 'node:path';
var O =
  (e = import.meta.url) =>
  (...t) =>
    oe(re(te(e)), ...t);
var se = O(import.meta.url),
  b = (e, {basepath: t, buildPath: r} = {}) => {
    t !== '/' &&
      e.get(t, (s, n, i) => {
        n.redirect(308, `${t}/${s.search ?? ''}`);
      });
    let o = t === '/' ? t : `${t}/`;
    e.get(`${o}{*splat}`, (s, n, i) => {
      if (n.headersSent) return i();
      n.sendFile(se(r, 'index.html'));
    });
  };
import {createProxyMiddleware as pe} from 'http-proxy-middleware';
import ne from 'jsonwebtoken';
var R = (e, {secret: t = '', ...r} = {}) => ne.verify(e, t, r);
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
      let i = R(n, e);
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
var ie = e =>
    h(e) ? [e]
    : Array.isArray(e) ? e
    : [],
  C = ({proxys: e = [], apiPrefix: t = '/'} = {}) =>
    ie(e).map(r => ((r.prefix = `${t}${r.prefix ?? (r.name ? `/${r.name}` : '')}`.replace('//', '/')), r)),
  M = e => (Array.isArray(e) ? e : []).filter(Boolean),
  N = (e, t) =>
    [...new Set(['/', '/health', t, ...(Array.isArray(e) ? e : [])])]
      .filter(Boolean)
      .map(r => `${t}${r}`.replace('//', '/'));
var U =
  (e = {}) =>
  (t, r, o) => {
    if (t.method === 'OPTIONS') return o();
    let s = M(e.whiteAuthKeys);
    if (N(e.whitePathList, e.apiPrefix).includes(t.path)) return o();
    let {authToken: i, jwtConfig: a} = e;
    if (typeof i == 'string' && i.length > 0 && i !== 'false') {
      let l = t.headers,
        c = l['x-huxy-auth'] || l['x-api-key'] || l.authorization || '',
        m = t.query.token || c.split('Bearer ')[1];
      return (m && m === i) || s.includes(m) ?
          o()
        : (t.log.error('\u8BA4\u8BC1\u5931\u8D25: \u65E0\u6548\u7684\u4EE4\u724C'),
          r.status(403).json({message: '\u65E0\u6548\u7684\u4EE4\u724C'}));
    }
    if (h(a)) return _({secret, expiresIn, algorithm, issuer})(t, r, o);
    o();
  };
var ae = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip', 'cf-ipcountry', 'cf-ray', 'x-huxy-auth'],
  ce = ['x-powered-by', 'server'],
  w = (e, t) => {
    (ae.forEach(r => e.removeHeader(r)), e.setHeader('Origin', t), e.setHeader('User-Agent', 'IHUXY-API/1.0'));
  },
  D = e => {
    (ce.forEach(t => e.removeHeader(t)),
      e.setHeader('Access-Control-Allow-Origin', '*'),
      e.setHeader('X-Content-Type-Options', 'nosniff'),
      e.getHeader('content-type')?.includes('text/event-stream') &&
        ((e.headers['Cache-Control'] = 'no-cache, no-transform'),
        (e.headers.Connection = 'keep-alive'),
        (e.headers['X-Accel-Buffering'] = 'no')));
  };
var me = (e, t = '/') => {
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
  le = ({target: e = 'http://', prefix: t, withPrefix: r, preserve: o = !1, ...s} = {}) => ({
    target: e,
    changeOrigin: !0,
    secure: !1,
    xfwd: !0,
    ws: !0,
    on: {
      proxyReq: (n, i, a) => {
        n.removeHeader && !o && w(n, e);
      },
      proxyReqWs: (n, i, a) => {
        n.removeHeader && !o && w(n, e);
      },
      proxyRes: (n, i, a) => {
        n.removeHeader && !o && D(n);
      },
      error: (n, i, a) => {
        let p = i.headers.upgrade?.toLowerCase() === 'websocket',
          l = i.url.includes('/socket.io') || i.url.includes('EIO=');
        !p && !l && (a.headersSent || a.status(502).json({error: '\u7F51\u5173\u9519\u8BEF'}));
      },
    },
    ...s,
  }),
  ue = (e, t) => {
    t?.length &&
      e.on('upgrade', (r, o, s) => {
        t.map(n => n.upgrade(r, o, s));
      });
  },
  de = (e, t = {}, r, o) => {
    let {apiPrefix: s = '/', proxys: n = [], serverLogger: i} = t;
    i === !1 ||
      typeof i == 'function' ||
      r.info(`\u{1F4DD} API \u63A5\u53E3\u5730\u5740: ${t.protocol}://${t.host ?? 'localhost'}:${t.port}${s}`);
    let p = [];
    (n.map(({prefix: l, target: c, withPrefix: m = !0, ...P}) => {
      c = m ? `${c}${l}` : c;
      let x = pe(le({prefix: l, target: c, withPrefix: m, ...P}));
      (e.use(l, U(t), x), r.info(`\u2705 \u4EE3\u7406\u4E2D ${l} \u{1F449} ${c}`), p.push(x));
    }),
      ue(o, p),
      me(e, s));
  },
  W = de;
import {Router as fe} from 'express';
var G = e => {
  let t = fe();
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
var he = {
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
  F = he;
var we = async (e, t = {}, r) => {
    if ((e.disable('x-powered-by'), e.set('trust proxy', t.trustProxy ?? !0), r.isPino)) {
      let s = (await import('pino-http')).default;
      e.use(s({logger: r, quietReqLogger: !0, autoLogging: !1, genReqId: !1}));
    } else
      e.use((s, n, i) => {
        ((s.log = r), i());
      });
    e.use(ge(t.cors));
    let {helmet: o} = t;
    if (o) {
      let s = (await import('helmet')).default;
      e.use(s(h(o) ? o : void 0));
    }
    e.use(K({filter: (s, n) => (n.getHeader('Content-Type') === 'text/event-stream' ? !1 : K.filter(s, n))}));
  },
  Ae = (e, t = {}) => {
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
  Pe = (e, t = {}, r, o) => {
    e.use(
      t.apiPrefix,
      xe({
        keyGenerator: n => ye(n.ip) || n.headers['x-huxy-auth'] || n.headers['x-api-key'] || n.headers.authorization,
        ...t.rateLimit,
      }),
    );
    let s = C(t);
    (s.length && W(e, {...t, proxys: s}, r, o),
      e.use(g.json({limit: '20mb'})),
      e.use(g.urlencoded({extended: !0, limit: '20mb'})));
  },
  Se = (e, t = {}, r, o) => {
    (o && b(e, t), e.use(G(t)), e.use(k(t, r)), e.use(j(t, r)));
  },
  Te = async (e = {}, t, r, o) => {
    let {logger: s, ...n} = E({...F, ...e}),
      i = s ?? (await T(n.loggerConfig, n.nodeEnv)),
      {port: a, ssl: p} = n;
    (await I(a)) ||
      ((n.port = Number(a) + 1),
      i.warn(`\u7AEF\u53E3 ${a} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${n.port}`));
    let c = g();
    await we(c, n, i);
    let m;
    p ?
      (h(p) ||
        (i.error(
          {ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}},
          '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}',
        ),
        process.exit(1)),
      (n.protocol = 'https'),
      (m = ve.createServer(p, c)),
      z((d, S) => {
        (S.writeHead(301, {Location: `${n.protocol}://${d.headers.host}${d.url}`}), S.end());
      }).listen(80))
    : (m = z(c));
    let {cors: P, helmet: x, rateLimit: Ie, jwtConfig: $e, ...f} = n;
    if (v(r))
      try {
        await r(f, c, m, i);
      } catch (d) {
        (i.error({err: d}, `\u274C \u94A9\u5B50\u51FD\u6570\u9519\u8BEF\uFF1A${d.message}`), process.exit(1));
      }
    if ((o && Ae(c, f), Pe(c, n, i, m), v(t)))
      try {
        await t(f, c, m, i);
      } catch (d) {
        (i.error({err: d}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${d.message}`), process.exit(1));
      }
    Se(c, f, i, o);
    try {
      (await H(m, f), L(f, i));
    } catch (d) {
      (i.error({err: d}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25\uFF01'), process.exit(1));
    }
    return ($(m, f, i), {config: f, app: c, httpServer: m, logger: i});
  },
  A = Te;
var Ee = (e, t, r) => A(e, t, r),
  St = (e, t, r) => A(e, t, r, !0),
  Tt = Ee;
export {Tt as default, Ee as startServer, St as startStatic};
