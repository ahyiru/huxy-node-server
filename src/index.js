import T from 'express';
import X from 'cors';
import {rateLimit as Q, ipKeyGenerator as J} from 'express-rate-limit';
import Y from 'compression';
import {createServer as O} from 'node:http';
import Z from 'node:https';
var D = async (o = {}, r) => {
    let t = (await import('pino')).default,
      e = r === 'development',
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
        ...o,
      });
    return ((s.isPino = !0), s);
  },
  f = D;
import U from 'node:os';
import G from 'node:net';
var p = (o = new Date()) => o.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  S = o => Object.prototype.toString.call(o).slice(8, -1).toLowerCase(),
  h = o => {
    let r = o ? 'https' : 'http',
      t = U.networkInterfaces(),
      e = [];
    return (Object.keys(t).map(i => e.push(...t[i])), e.filter(i => i.family === 'IPv4').map(i => i.address));
  },
  E = o => {
    let r = o ?? process.argv.slice(2) ?? [],
      t = {};
    return (
      r.map(e => {
        let [s, i] = e.split('=');
        t[s] = i;
      }),
      t
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
  W = (o, r, t) => {
    let [e, s] = o.split('.');
    e && s ? (t[e] || (t[e] = {}), (t[e][s] = r)) : (t[e] = r);
  },
  F = o => {
    let {connectSrc: r, ...t} = o;
    if (!r) return t;
    (t.helmet.contentSecurityPolicy || (t.helmet.contentSecurityPolicy = {}),
      t.helmet.contentSecurityPolicy.directives || (t.helmet.contentSecurityPolicy.directives = {}));
    let e =
      typeof r == 'string' ? r.split(',').map(s => s.trim())
      : Array.isArray(r) ? r
      : [];
    return (
      (t.helmet.contentSecurityPolicy.directives.connectSrc = [
        ...t.helmet.contentSecurityPolicy.directives.connectSrc,
        ...e,
      ]),
      t
    );
  },
  K = o =>
    (o || '').length < 2 ? '/'
    : o.endsWith('/') ? o.slice(0, -1)
    : o,
  v = (o = {}, r = V) => {
    let {env: t} = process;
    Object.keys(r).map(s => {
      let i = t[s] ?? o[s];
      i && W(r[s], i, o);
    });
    let e = {...o, ...E()};
    return (
      (e.port = e.staticPort || e.port),
      (e.isDev = e.nodeEnv === 'development'),
      (e.basepath = K(e.basepath)),
      (e.protocol = 'http'),
      F(e)
    );
  },
  g = (o, r = '127.0.0.1') =>
    new Promise(t => {
      let e = G.createServer();
      (e.once('error', s => {
        (e.close(), t((s.code === 'EADDRINUSE', !1)));
      }),
        e.once('listening', () => {
          (e.close(), t(!0));
        }),
        e.listen(Number(o), r));
    }),
  w = (o, r = {}, t) => {
    let e = s => {
      (t.warn(`\u6536\u5230 ${s} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        o.close(async () => {
          (t.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), await r.shutdown?.(), process.exit(0));
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
  I = (o, {port: r = 3e3, host: t = '0.0.0.0'} = {}) =>
    new Promise((e, s) => {
      (o.once('error', s), o.once('listening', () => e(o)), o.listen(r, t));
    }),
  L = (o, r = 56) => {
    let t = o.length,
      e = r - t,
      s = ~~(e / 2);
    return `${'-'.repeat(s)}${o}${'-'.repeat(e - s)}`;
  };
var $ = (o, r) => (t, e, s) => {
    (r.error(
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
  A = (o, r) => (t, e, s, i) => {
    let n = t.status || 500,
      l = t.message,
      a = '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF';
    (r.error(
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
      s.status(n).json({success: !1, message: o.isDev ? l : a, stack: o.isDev ? t.stack : void 0, timestamp: p()}));
  };
import {Router as z} from 'express';
var B = o => {
    let r = z();
    return (
      r.use('/health', (t, e) => {
        e.status(200).json({
          status: 'OK',
          timestamp: p(),
          environment: o.nodeEnv,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          pid: process.pid,
        });
      }),
      r.get('/', (t, e) => {
        e.status(200).json({
          message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D',
          timestamp: p(),
          environment: o.nodeEnv,
        });
      }),
      r
    );
  },
  b = B;
var q = async (o, r = {}, t) => {
    if ((o.disable('x-powered-by'), o.set('trust proxy', r.trustProxy ?? !0), t.isPino)) {
      let e = (await import('pino-http')).default;
      o.use(e({logger: t, quietReqLogger: !0, autoLogging: !1}));
    } else
      o.use((e, s, i) => {
        e.log = t;
      });
    if ((o.use(Y()), o.use(X(r.cors)), r.helmet)) {
      let e = (await import('helmet')).default;
      o.use(e(S(r.helmet) === 'object' ? r.helmet : {}));
    }
    (o.use(
      r.apiPrefix,
      Q({
        keyGenerator: e => J(e.ip) || e.headers['x-huxy-auth'] || e.headers['x-api-key'] || e.headers.authorization,
        ...r.rateLimit,
      }),
    ),
      o.use(T.json({limit: '20mb'})),
      o.use(T.urlencoded({extended: !0, limit: '20mb'})));
  },
  ee = (o, r = {}, t) => {
    (o.use(b(r)), o.use($(r, t)), o.use(A(r, t)));
  },
  te = async (o = {}, r) => {
    let {logger: t, ...e} = v(o),
      s = t ?? (await f(e.loggerConfig, e.nodeEnv)),
      {port: i, ssl: n} = e;
    (await g(i, e.host)) ||
      ((e.port = Number(i) + 1),
      s.warn(`\u7AEF\u53E3 ${i} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${e.port}`));
    let a = T();
    await q(a, e, s);
    let m;
    (n ?
      (S(n) === 'object' ||
        (s.error(
          {ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}},
          '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}',
        ),
        process.exit(1)),
      (e.protocol = 'https'),
      (m = Z.createServer(n, a)),
      O((u, d) => {
        (d.writeHead(301, {Location: `${e.protocol}://${u.headers.host}${u.url}`}), d.end());
      }).listen(80))
    : (m = O(a)),
      w(m, e, s));
    try {
      await I(m, e);
    } catch (c) {
      (s.error({err: c}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25'), process.exit(1));
    }
    try {
      await r?.(e, a, m, s);
    } catch (c) {
      (s.error({err: c}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${c.message}`), process.exit(1));
    }
    return (ee(a, e, s), {app: a, httpServer: m, config: e, logger: s});
  },
  R = te;
var oe = {
    nodeEnv: process.env.NODE_ENV,
    isDev: process.env.NODE_ENV,
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    basepath: process.env.BASEPATH || '/',
    apiPrefix: '/api',
    cors: {origin: process.env.CORS_ORIGIN?.split(',') || '*'},
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000', 10),
      limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '150', 10),
      skip: o => {
        let {path: r, url: t} = o;
        return !!(
          r.startsWith('/static/') ||
          /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/i.test(r) ||
          r === '/health' ||
          r === '/ready' ||
          t.includes('/socket.io') ||
          t.includes('EIO=')
        );
      },
      message: {message: '\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5'},
    },
    logLevel: process.env.LOG_LEVEL || 30,
  },
  _ = oe;
var re = (o, r, t) =>
    R({..._, ...o}, async (e, s, i, n) => {
      let {port: l, host: a, nodeEnv: m, basepath: c, appName: u = 'HuxyServer', protocol: d} = e;
      if (!t) {
        let H = h()
          .filter(y => y !== a)
          .map(y => `${d}://${y}:${l}${c}`);
        (n.info(L(u)),
          n.info(`\u{1F680} \u670D\u52A1\u8FD0\u884C\u5728\u3010${m}\u3011\u73AF\u5883: ${d}://${a}:${l}${c}`),
          n.info(`-----------------[${p()}]------------------`),
          n.info({ips: H}, '\u672C\u5730\u5730\u5740'));
      }
      await r?.(e, s, i, n);
    }),
  x = re;
import ie from 'express';
import {fileURLToPath as k} from 'node:url';
import {dirname as N, resolve as se} from 'node:path';
var M = (o = import.meta.url) => N(k(o)),
  P =
    (o = import.meta.url) =>
    (...r) =>
      se(N(k(o)), ...r),
  j = P;
var ne = j(import.meta.url),
  ae = {port: 9e3, host: 'localhost', buildPath: './build'},
  ce = (o, r) =>
    x({...ae, ...o}, async (t, e, s, i) => {
      await r?.(t, e, s, i);
      let {basepath: n, buildPath: l} = t;
      (e.use(n, ie.static(l, {...t.staticCache})),
        n !== '/' &&
          e.get(n, (m, c, u) => {
            c.redirect(308, `${n}/${m.search ?? ''}`);
          }));
      let a = n === '/' ? n : `${n}/`;
      e.get(`${a}{*splat}`, (m, c, u) => {
        if (c.headersSent) return u();
        c.sendFile(ne(l, 'index.html'));
      });
    }),
  C = ce;
var ze = {
  startServer: x,
  startStatic: C,
  createLogger: f,
  dateTime: p,
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
  p as dateTime,
  ze as default,
  M as getDirName,
  v as getEnvConfig,
  h as localIPs,
  E as nodeArgs,
  P as resolvePath,
  x as startServer,
  C as startStatic,
};
