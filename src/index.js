import T from 'express';
import B from 'cors';
import {rateLimit as X, ipKeyGenerator as Q} from 'express-rate-limit';
import J from 'compression';
import {createServer as O} from 'node:http';
import Y from 'node:https';
var C = async (r = {}, o) => {
    let t = (await import('pino')).default,
      e = o === 'development',
      s = t({
        name: 'Huxy',
        level: 'info',
        timestamp: t.stdTimeFunctions.isoTime,
        base: e ? void 0 : {},
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
          e ?
            {
              target: 'pino-pretty',
              options: {colorize: !0, translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', ignore: 'pid,hostname,name'},
            }
          : void 0,
        ...r,
      });
    return ((s.isPino = !0), s);
  },
  f = C;
import D from 'node:os';
import U from 'node:net';
var p = (r = new Date()) => r.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  S = r => Object.prototype.toString.call(r).slice(8, -1).toLowerCase(),
  h = r => {
    let o = r ? 'https' : 'http',
      t = D.networkInterfaces(),
      e = [];
    return (Object.keys(t).map(i => e.push(...t[i])), e.filter(i => i.family === 'IPv4').map(i => i.address));
  },
  E = r => {
    let o = r ?? process.argv.slice(2) ?? [],
      t = {};
    return (
      o.map(e => {
        let [s, i] = e.split('=');
        t[s] = i;
      }),
      t
    );
  },
  G = {
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
  V = (r, o, t) => {
    let [e, s] = r.split('.');
    e && s ? (t[e] || (t[e] = {}), (t[e][s] = o)) : (t[e] = o);
  },
  W = r => {
    let {connectSrc: o, ...t} = r;
    if (!o) return t;
    (t.helmet.contentSecurityPolicy || (t.helmet.contentSecurityPolicy = {}),
      t.helmet.contentSecurityPolicy.directives || (t.helmet.contentSecurityPolicy.directives = {}));
    let e =
      typeof o == 'string' ? o.split(',').map(s => s.trim())
      : Array.isArray(o) ? o
      : [];
    return (
      (t.helmet.contentSecurityPolicy.directives.connectSrc = [
        ...t.helmet.contentSecurityPolicy.directives.connectSrc,
        ...e,
      ]),
      t
    );
  },
  F = r =>
    (r || '').length < 2 ? '/'
    : r.endsWith('/') ? r.slice(0, -1)
    : r,
  v = (r = {}, o = G) => {
    let {env: t} = process;
    Object.keys(o).map(s => {
      let i = t[s] ?? r[s];
      i && V(o[s], i, r);
    });
    let e = {...r, ...E()};
    return (
      (e.port = e.staticPort || e.port),
      (e.isDev = e.nodeEnv === 'development'),
      (e.basepath = F(e.basepath)),
      (e.protocol = 'http'),
      W(e)
    );
  },
  x = (r, o = '127.0.0.1') =>
    new Promise(t => {
      let e = U.createServer();
      (e.once('error', s => {
        (e.close(), t((s.code === 'EADDRINUSE', !1)));
      }),
        e.once('listening', () => {
          (e.close(), t(!0));
        }),
        e.listen(Number(r), o));
    }),
  w = (r, o = {}, t) => {
    let e = s => {
      (t.warn(`\u6536\u5230 ${s} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        r.close(async () => {
          (t.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), await o.shutdown?.(), process.exit(0));
        }),
        setTimeout(() => {
          (t.error('\u274C \u5F3A\u5236\u5173\u95ED\u670D\u52A1\u5668'), process.exit(1));
        }, 5e3));
    };
    (process.on('SIGTERM', () => e('SIGTERM')),
      process.on('SIGINT', () => e('SIGINT')),
      process.on('uncaughtException', s => {
        (t.fatal(s, `\u{1F4A5} \u672A\u6355\u83B7\u7684\u5F02\u5E38: ${s.message}`), process.exit(1));
      }),
      process.on('unhandledRejection', (s, i) => {
        (t.fatal({reason: s, promise: i}, '\u26A0\uFE0F \u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'),
          process.exit(1));
      }));
  },
  I = (r, {port: o = 3e3, host: t = '::'} = {}) =>
    new Promise((e, s) => {
      (r.once('error', s), r.once('listening', () => e(r)), r.listen(o, t));
    }),
  L = (r, o = 56) => {
    let t = r.length,
      e = o - t,
      s = ~~(e / 2);
    return `${'-'.repeat(s)}${r}${'-'.repeat(e - s)}`;
  };
var A = (r, o) => (t, e, s) => {
    (o.error(
      {
        message: 'Not Found',
        timestamp: p(),
        url: t.originalUrl,
        method: t.method,
        ip: t.ip,
        userAgent: t.get('User-Agent'),
      },
      '\u627E\u4E0D\u5230\u8DEF\u5F84',
    ),
      e
        .status(404)
        .json({
          success: !1,
          status: 404,
          url: t.originalUrl,
          message: `\u8DEF\u7531 [${t.method} ${t.originalUrl}] \u4E0D\u5B58\u5728`,
          timestamp: p(),
        }));
  },
  $ = (r, o) => (t, e, s, i) => {
    let n = t.status || 500,
      l = t.message,
      a = '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF';
    (o.error(
      {
        message: l,
        timestamp: p(),
        stack: t.stack,
        url: e.originalUrl,
        method: e.method,
        ip: e.ip,
        userAgent: e.get('User-Agent'),
      },
      a,
    ),
      s.status(n).json({success: !1, message: r.isDev ? l : a, stack: r.isDev ? t.stack : void 0, timestamp: p()}));
  };
import {Router as K} from 'express';
var z = r => {
    let o = K();
    return (
      o.use('/health', (t, e) => {
        e.status(200).json({
          status: 'OK',
          timestamp: p(),
          environment: r.nodeEnv,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          pid: process.pid,
        });
      }),
      o.get('/', (t, e) => {
        e.status(200).json({
          message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D',
          timestamp: p(),
          environment: r.nodeEnv,
        });
      }),
      o
    );
  },
  b = z;
var Z = async (r, o = {}, t) => {
    if ((r.disable('x-powered-by'), r.set('trust proxy', o.trustProxy ?? !0), t.isPino)) {
      let e = (await import('pino-http')).default;
      r.use(e({logger: t, quietReqLogger: !0, autoLogging: !1}));
    } else
      r.use((e, s, i) => {
        e.log = t;
      });
    if ((r.use(J()), r.use(B(o.cors)), o.helmet)) {
      let e = (await import('helmet')).default;
      r.use(e(S(o.helmet) === 'object' ? o.helmet : {}));
    }
    (r.use(
      o.apiPrefix,
      X({
        keyGenerator: e => Q(e.ip) || e.headers['x-huxy-auth'] || e.headers['x-api-key'] || e.headers.authorization,
        ...o.rateLimit,
      }),
    ),
      r.use(T.json({limit: '20mb'})),
      r.use(T.urlencoded({extended: !0, limit: '20mb'})));
  },
  q = (r, o = {}, t) => {
    (r.use(b(o)), r.use(A(o, t)), r.use($(o, t)));
  },
  ee = async (r = {}, o) => {
    let {logger: t, ...e} = v(r),
      s = t ?? (await f(e.loggerConfig, e.nodeEnv)),
      {port: i, ssl: n} = e;
    (await x(i, e.host)) ||
      ((e.port = Number(i) + 1),
      s.warn(`\u7AEF\u53E3 ${i} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${e.port}`));
    let a = T();
    await Z(a, e, s);
    let c;
    (n ?
      (S(n) === 'object' ||
        (s.error(
          {ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}},
          '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}',
        ),
        process.exit(1)),
      (e.protocol = 'https'),
      (c = Y.createServer(n, a)),
      O((u, d) => {
        (d.writeHead(301, {Location: `${e.protocol}://${u.headers.host}${u.url}`}), d.end());
      }).listen(80))
    : (c = O(a)),
      w(c, e, s));
    try {
      await I(c, e);
    } catch (m) {
      (s.error({err: m}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25'), process.exit(1));
    }
    try {
      await o?.(e, a, c, s);
    } catch (m) {
      (s.error({err: m}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${m.message}`), process.exit(1));
    }
    return (q(a, e, s), {app: a, httpServer: c, config: e, logger: s});
  },
  R = ee;
var te = {
    nodeEnv: process.env.NODE_ENV,
    isDev: process.env.NODE_ENV,
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '::',
    basepath: process.env.BASEPATH || '/',
    apiPrefix: '/api',
    cors: {origin: process.env.CORS_ORIGIN?.split(',') || '*'},
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000', 10),
      limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '150', 10),
      skip: r => {
        let {path: o, url: t} = r;
        return !!(
          o.startsWith('/static/') ||
          /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/i.test(o) ||
          o === '/health' ||
          o === '/ready' ||
          t.includes('/socket.io') ||
          t.includes('EIO=')
        );
      },
      message: {message: '\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5'},
    },
    logLevel: process.env.LOG_LEVEL || 30,
  },
  _ = te;
var re = (r, o, t) =>
    R({..._, ...r}, async (e, s, i, n) => {
      let {port: l, host: a, basepath: c, appName: m = 'HuxyServer', protocol: u} = e;
      if (!t) {
        let d = h()
          .filter(y => y !== a)
          .map(y => `${u}://${y}:${l}${c}`);
        (n.info(L(m)),
          n.info(`\u{1F680} \u670D\u52A1\u6B63\u5728\u8FD0\u884C: ${u}://${a}:${l}${c}`),
          n.info(`-----------------[${p()}]------------------`),
          n.info({ips: d}, '\u672C\u5730\u5730\u5740'));
      }
      await o?.(e, s, i, n);
    }),
  g = re;
import se from 'express';
import {fileURLToPath as k} from 'node:url';
import {dirname as N, resolve as oe} from 'node:path';
var M = (r = import.meta.url) => N(k(r)),
  P =
    (r = import.meta.url) =>
    (...o) =>
      oe(N(k(r)), ...o),
  j = P;
var ie = j(import.meta.url),
  ne = (r, o) =>
    g(r, async (t, e, s, i) => {
      await o?.(t, e, s, i);
      let {basepath: n, buildPath: l} = t;
      (e.use(n, se.static(l, {...t.staticCache})),
        n !== '/' &&
          e.get(n, (c, m, u) => {
            m.redirect(308, `${n}/${c.search ?? ''}`);
          }));
      let a = n === '/' ? n : `${n}/`;
      e.get(`${a}{*splat}`, (c, m, u) => {
        if (m.headersSent) return u();
        m.sendFile(ie(l, 'index.html'));
      });
    }),
  H = ne;
var Fe = {
  startServer: g,
  startStatic: H,
  createLogger: f,
  dateTime: p,
  localIPs: h,
  nodeArgs: E,
  getEnvConfig: v,
  checkPort: x,
  getDirName: M,
  resolvePath: P,
};
export {
  x as checkPort,
  f as createLogger,
  p as dateTime,
  Fe as default,
  M as getDirName,
  v as getEnvConfig,
  h as localIPs,
  E as nodeArgs,
  P as resolvePath,
  g as startServer,
  H as startStatic,
};
