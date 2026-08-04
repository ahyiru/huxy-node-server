import T from 'express';
import X from 'cors';
import {rateLimit as Q, ipKeyGenerator as J} from 'express-rate-limit';
import Y from 'compression';
import {createServer as R} from 'node:http';
import Z from 'node:https';
var D = async (t = {}, r) => {
    let o = (await import('pino')).default,
      e = r === 'development',
      s = o({
        name: 'Huxy',
        level: 'info',
        timestamp: o.stdTimeFunctions.isoTime,
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
        ...t,
      });
    return ((s.isPino = !0), s);
  },
  f = D;
import U from 'node:os';
import G from 'node:net';
var m = (t = new Date()) => t.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  S = t => Object.prototype.toString.call(t).slice(8, -1).toLowerCase(),
  h = t => {
    let r = t ? 'https' : 'http',
      o = U.networkInterfaces(),
      e = [];
    return (Object.keys(o).map(i => e.push(...o[i])), e.filter(i => i.family === 'IPv4').map(i => i.address));
  },
  E = t => {
    let r = t ?? process.argv.slice(2) ?? [],
      o = {};
    return (
      r.map(e => {
        let [s, i] = e.split('=');
        o[s] = i;
      }),
      o
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
  W = (t, r, o) => {
    let [e, s] = t.split('.');
    e && s ? (o[e] || (o[e] = {}), (o[e][s] = r)) : (o[e] = r);
  },
  F = t => {
    let {connectSrc: r, ...o} = t;
    if (!r) return o;
    (o.helmet.contentSecurityPolicy || (o.helmet.contentSecurityPolicy = {}),
      o.helmet.contentSecurityPolicy.directives || (o.helmet.contentSecurityPolicy.directives = {}));
    let e =
      typeof r == 'string' ? r.split(',').map(s => s.trim())
      : Array.isArray(r) ? r
      : [];
    return (
      (o.helmet.contentSecurityPolicy.directives.connectSrc = [
        ...o.helmet.contentSecurityPolicy.directives.connectSrc,
        ...e,
      ]),
      o
    );
  },
  K = t =>
    t?.length < 2 ? '/'
    : t.endsWith('/') ? t.slice(0, -1)
    : t,
  v = (t = {}, r = V) => {
    let {env: o} = process;
    Object.keys(r).map(s => {
      let i = o[s] ?? t[s];
      i && W(r[s], i, t);
    });
    let e = {...t, ...E()};
    return (
      (e.port = e.staticPort || e.port),
      (e.isDev = e.nodeEnv === 'development'),
      (e.basepath = K(e.basepath)),
      (e.protocol = 'http'),
      F(e)
    );
  },
  g = (t, r = '127.0.0.1') =>
    new Promise(o => {
      let e = G.createServer();
      (e.once('error', s => {
        (e.close(), o((s.code === 'EADDRINUSE', !1)));
      }),
        e.once('listening', () => {
          (e.close(), o(!0));
        }),
        e.listen(Number(t), r));
    }),
  w = (t, r = {}, o) => {
    let e = s => {
      (o.warn(`\u6536\u5230 ${s} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        t.close(async () => {
          (o.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), await r.shutdown?.(), process.exit(0));
        }),
        setTimeout(() => {
          (o.error('\u274C \u5F3A\u5236\u5173\u95ED\u670D\u52A1\u5668'), process.exit(1));
        }, 5e3));
    };
    (process.on('SIGTERM', () => e('SIGTERM')),
      process.on('SIGINT', () => e('SIGINT')),
      process.on('uncaughtException', s => {
        (o.fatal(s, `\u{1F4A5} \u672A\u6355\u83B7\u7684\u5F02\u5E38: ${s.message}`), process.exit(1));
      }),
      process.on('unhandledRejection', (s, i) => {
        (o.fatal({reason: s, promise: i}, '\u26A0\uFE0F \u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'),
          process.exit(1));
      }));
  },
  I = (t, {port: r = 3e3, host: o = '0.0.0.0'} = {}) =>
    new Promise((e, s) => {
      (t.once('error', s), t.once('listening', () => e(t)), t.listen(r, o));
    }),
  L = (t, r = 56) => {
    let o = t.length,
      e = r - o,
      s = ~~(e / 2);
    return `${'-'.repeat(s)}${t}${'-'.repeat(e - s)}`;
  };
var $ = (t, r) => (o, e, s) => {
    (r.error(
      {
        message: 'Not Found',
        timestamp: m(),
        url: o.originalUrl,
        method: o.method,
        ip: o.ip,
        userAgent: o.get('User-Agent'),
      },
      '\u627E\u4E0D\u5230\u8DEF\u5F84',
    ),
      e
        .status(404)
        .json({
          success: !1,
          status: 404,
          url: o.originalUrl,
          message: `\u8DEF\u7531 [${o.method} ${o.originalUrl}] \u4E0D\u5B58\u5728`,
          timestamp: m(),
        }));
  },
  A = (t, r) => (o, e, s, i) => {
    let n = o.status || 500,
      l = o.message,
      a = '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF';
    (r.error(
      {
        message: l,
        timestamp: m(),
        stack: o.stack,
        url: e.originalUrl,
        method: e.method,
        ip: e.ip,
        userAgent: e.get('User-Agent'),
      },
      a,
    ),
      s.status(n).json({success: !1, message: t.isDev ? l : a, stack: t.isDev ? o.stack : void 0, timestamp: m()}));
  };
import {Router as z} from 'express';
var B = t => {
    let r = z();
    return (
      r.use('/health', (o, e) => {
        e.status(200).json({
          status: 'OK',
          timestamp: m(),
          environment: t.nodeEnv,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          pid: process.pid,
        });
      }),
      r.get('/', (o, e) => {
        e.status(200).json({
          message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D',
          timestamp: m(),
          environment: t.nodeEnv,
        });
      }),
      r
    );
  },
  b = B;
var q = async (t, r = {}, o) => {
    if ((t.disable('x-powered-by'), t.set('trust proxy', r.trustProxy ?? !0), o.isPino)) {
      let e = (await import('pino-http')).default;
      t.use(e({logger: o, quietReqLogger: !0, autoLogging: !1}));
    } else
      t.use((e, s, i) => {
        e.log = o;
      });
    if ((t.use(Y()), t.use(X(r.cors)), r.helmet)) {
      let e = (await import('helmet')).default;
      t.use(e(S(r.helmet) === 'object' ? r.helmet : {}));
    }
    (t.use(
      r.apiPrefix,
      Q({
        keyGenerator: e => J(e.ip) || e.headers['x-huxy-auth'] || e.headers['x-api-key'] || e.headers.authorization,
        ...r.rateLimit,
      }),
    ),
      t.use(T.json({limit: '20mb'})),
      t.use(T.urlencoded({extended: !0, limit: '20mb'})));
  },
  ee = (t, r = {}, o) => {
    (t.use(b(r)), t.use($(r, o)), t.use(A(r, o)));
  },
  te = async (t = {}, r) => {
    let {logger: o, ...e} = v(t),
      s = o ?? (await f(e.loggerConfig, e.nodeEnv)),
      {port: i, ssl: n} = e;
    (await g(i, e.host)) ||
      ((e.port = Number(i) + 1),
      s.warn(`\u7AEF\u53E3 ${i} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${e.port}`));
    let a = T();
    await q(a, e, s);
    let c;
    (n ?
      (S(n) === 'object' ||
        (s.error(
          {ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}},
          '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}',
        ),
        process.exit(1)),
      (e.protocol = 'https'),
      (c = Z.createServer(n, a)),
      R((u, d) => {
        (d.writeHead(301, {Location: `${e.protocol}://${u.headers.host}${u.url}`}), d.end());
      }).listen(80))
    : (c = R(a)),
      w(c, e, s));
    try {
      await I(c, e);
    } catch (p) {
      (s.error({err: p}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25'), process.exit(1));
    }
    try {
      await r?.(e, a, c, s);
    } catch (p) {
      (s.error({err: p}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${p.message}`), process.exit(1));
    }
    return (ee(a, e, s), {app: a, httpServer: c, config: e, logger: s});
  },
  O = te;
var oe = {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    basepath: process.env.BASEPATH || '/',
    apiPrefix: '/api',
    cors: {origin: process.env.CORS_ORIGIN?.split(',') || '*'},
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000', 10),
      limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '150', 10),
      skip: t => {
        let {path: r} = t;
        return !!(
          r.startsWith('/static/') ||
          /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/i.test(r) ||
          r === '/health' ||
          r === '/ready'
        );
      },
      message: {message: '\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5'},
    },
    logLevel: process.env.LOG_LEVEL || 30,
  },
  _ = oe;
var re = (t, r, o) =>
    O({..._, ...t}, async (e, s, i, n) => {
      let {port: l, host: a, nodeEnv: c, basepath: p, appName: u = 'HuxyServer', protocol: d} = e;
      if (!o) {
        let H = h()
          .filter(y => y !== a)
          .map(y => `${d}://${y}:${l}${p}`);
        (n.info(L(u)),
          n.info(`\u{1F680} \u670D\u52A1\u8FD0\u884C\u5728\u3010${c}\u3011\u73AF\u5883: ${d}://${a}:${l}${p}`),
          n.info(`-----------------[${m()}]------------------`),
          n.info({ips: H}, '\u672C\u5730\u5730\u5740'));
      }
      await r?.(e, s, i, n);
    }),
  x = re;
import ie from 'express';
import {fileURLToPath as N} from 'node:url';
import {dirname as k, resolve as se} from 'node:path';
var M = (t = import.meta.url) => k(N(t)),
  P =
    (t = import.meta.url) =>
    (...r) =>
      se(k(N(t)), ...r),
  j = P;
var ne = j(import.meta.url),
  ae = {port: 9e3, host: 'localhost', buildPath: './build'},
  ce = (t, r) =>
    x({...ae, ...t}, async (o, e, s, i) => {
      await r?.(o, e, s, i);
      let {basepath: n, buildPath: l} = o;
      (e.use(n, ie.static(l, {...o.staticCache})),
        n !== '/' &&
          e.get(n, (c, p, u) => {
            p.redirect(308, `${n}/${c.search ?? ''}`);
          }));
      let a = n === '/' ? n : `${n}/`;
      e.get(`${a}{*splat}`, (c, p, u) => {
        if (p.headersSent) return u();
        c.sendFile(ne(l, 'index.html'));
      });
    }),
  C = ce;
var ze = {
  startServer: x,
  startStatic: C,
  createLogger: f,
  dateTime: m,
  localIPs: h,
  nodeArgs: E,
  getEnvConfig: v,
  checkPort: g,
  getDirName: M,
  resolvePath: P,
};
export {
  g as checkPort,
  f as createLogger,
  m as dateTime,
  ze as default,
  M as getDirName,
  v as getEnvConfig,
  h as localIPs,
  E as nodeArgs,
  P as resolvePath,
  x as startServer,
  C as startStatic,
};
