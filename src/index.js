import y from 'express';
import X from 'helmet';
import Q from 'cors';
import {rateLimit as J, ipKeyGenerator as Y} from 'express-rate-limit';
import Z from 'compression';
import q from 'pino-http';
import {createServer as M} from 'node:http';
import ee from 'node:https';
import R from 'pino';
import j from 'node:os';
import G from 'node:net';
var c = (e = new Date()) => e.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  w = e => Object.prototype.toString.call(e).slice(8, -1).toLowerCase(),
  f = e => {
    let r = e ? 'https' : 'http',
      t = j.networkInterfaces(),
      o = [];
    return (Object.keys(t).map(i => o.push(...t[i])), o.filter(i => i.family === 'IPv4').map(i => i.address));
  },
  E = e => {
    let r = e ?? process.argv.slice(2) ?? [],
      t = {};
    return (
      r.map(o => {
        let [s, i] = o.split('=');
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
  F = (e, r, t) => {
    let [o, s] = e.split('.');
    o && s ? (t[o] || (t[o] = {}), (t[o][s] = r)) : (t[o] = r);
  },
  W = e => (e ? (e.endsWith('/') ? e : `${e}/`) : '/'),
  h = (e = {}, r = V) => {
    let {env: t} = process;
    Object.keys(r).map(s => {
      let i = t[s] ?? e[s];
      i && F(r[s], i, e);
    });
    let o = {...e, ...E()};
    return ((o.port = o.staticPort || o.port), (o.isDev = o.NODE_ENV === 'development'), (o.basepath = W(o.basepath)), (o.protocol = 'http'), o);
  },
  g = (e, r = '127.0.0.1') =>
    new Promise(t => {
      let o = G.createServer();
      (o.once('error', s => {
        (o.close(), t((s.code === 'EADDRINUSE', !1)));
      }),
        o.once('listening', () => {
          (o.close(), t(!0));
        }),
        o.listen(Number(e), r));
    }),
  b = (e, r = {}, t) => {
    let o = s => {
      (t.warn(`\u6536\u5230 ${s} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        e.close(async () => {
          (t.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), await r.shutdown?.(), process.exit(0));
        }),
        setTimeout(() => {
          (t.error('\u274C \u5F3A\u5236\u5173\u95ED\u670D\u52A1\u5668'), process.exit(1));
        }, 5e3));
    };
    (process.on('SIGTERM', () => o('SIGTERM')),
      process.on('SIGINT', () => o('SIGINT')),
      process.on('uncaughtException', s => {
        (t.fatal(s, `\u{1F4A5} \u672A\u6355\u83B7\u7684\u5F02\u5E38: ${s.message}`), process.exit(1));
      }),
      process.on('unhandledRejection', (s, i) => {
        (t.fatal({reason: s, promise: i}, '\u26A0\uFE0F \u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'), process.exit(1));
      }));
  },
  A = (e, {port: r, host: t = '0.0.0.0'} = {}) =>
    new Promise((o, s) => {
      let i = p => {
          (a(), s(p));
        },
        n = () => {
          (a(), o(e));
        },
        a = () => {
          (e.off('error', i), e.off('listening', n));
        };
      (e.once('error', i), e.once('listening', n), e.listen(r, t));
    }),
  $ = (e, r = 56) => {
    let t = e.length,
      o = r - t,
      s = ~~(o / 2);
    return `${'-'.repeat(s)}${e}${'-'.repeat(o - s)}`;
  };
import 'dotenv';
var K = {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    basepath: process.env.BASEPATH || '/',
    apiPrefix: '/',
    cors: {origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: !0},
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000', 10),
      limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      message: {message: '\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5'},
    },
    helmet: {
      contentSecurityPolicy: {directives: {defaultSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], scriptSrc: ["'self'", "'unsafe-eval'"], imgSrc: ["'self'", 'data:', 'https:']}},
      crossOriginEmbedderPolicy: !1,
    },
    logLevel: process.env.LOG_LEVEL || 30,
  },
  v = K;
var u = (e, r) =>
  R({
    name: e,
    level: v.logLevel,
    formatters: {level: t => ({level: t})},
    timestamp: R.stdTimeFunctions.isoTime,
    base: null,
    transport: {target: 'pino-pretty', options: {colorize: !0, sync: !0, levelFirst: !0}, ignore: 'pid,hostname,level,time', translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'},
    ...r,
  });
var m = u('huxy');
var O = u('error-handler'),
  N = e => (r, t, o) => {
    (O.error({message: 'Not Found', timestamp: c(), url: r.originalUrl, method: r.method, ip: r.ip, userAgent: r.get('User-Agent')}, '\u627E\u4E0D\u5230\u8DEF\u5F84'),
      t.status(404).json({success: !1, status: 404, url: r.originalUrl, message: `\u8DEF\u7531 [${r.method} ${r.originalUrl}] \u4E0D\u5B58\u5728`, timestamp: c()}));
  },
  _ = e => (r, t, o, s) => {
    let i = r.status || 500,
      n = r.message;
    (O.error({message: n, timestamp: c(), stack: r.stack, url: t.originalUrl, method: t.method, ip: t.ip, userAgent: t.get('User-Agent')}, '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF'),
      o.status(i).json({success: !1, message: (e.isDev, n), stack: e.isDev ? r.stack : void 0, timestamp: c()}));
  };
import {Router as z} from 'express';
var B = e => {
    let r = z();
    return (
      r.use('/health', (t, o) => {
        o.status(200).json({status: 'OK', timestamp: c(), environment: e.nodeEnv, uptime: process.uptime(), memoryUsage: process.memoryUsage(), pid: process.pid});
      }),
      r.get('/', (t, o) => {
        o.status(200).json({message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D', timestamp: c(), environment: e.nodeEnv});
      }),
      r
    );
  },
  D = B;
var te = (e, r = {}) => {
    (e.disable('x-powered-by'),
      e.set('trust proxy', 1),
      e.use(q({logger: m, quietReqLogger: !0, autoLogging: !1, genReqId: !1})),
      e.use(Z()),
      e.use(X(r.helmet)),
      e.use(Q(r.cors)),
      e.use(r.apiPrefix, J({keyGenerator: t => Y(t.ip) || t.headers['x-huxy-auth'] || t.headers['x-api-key'] || t.headers.authorization, ...r.rateLimit})),
      e.use(y.json({limit: '20mb'})),
      e.use(y.urlencoded({extended: !0, limit: '20mb'})));
  },
  oe = (e, r = {}) => {
    (e.use(D(r)), e.use(N(r)), e.use(_(r)));
  },
  re = async (e, r) => {
    let t = h(e),
      {port: o, ssl: s} = t;
    (await g(o, t.host)) || ((t.port = Number(o) + 1), m.warn(`\u7AEF\u53E3 ${o} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${t.port}`));
    let n = y();
    te(n, t);
    let a;
    (s
      ? (w(s) === 'object' ||
          (m.error({ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}}, '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}'), process.exit(1)),
        (t.protocol = 'https'),
        (a = ee.createServer(s, n)),
        M((d, l) => {
          (l.writeHead(301, {Location: `${t.protocol}://${d.headers.host}${d.url}`}), l.end());
        }).listen(80))
      : (a = M(n)),
      b(a, t, m));
    try {
      await A(a, t);
    } catch (p) {
      (m.error({err: p}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25'), process.exit(1));
    }
    try {
      await r?.(t, n, a, m);
    } catch (p) {
      (m.error({err: p}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${p.message}`), process.exit(1));
    }
    return (oe(n, t), {app: n, httpServer: a, config: t, logger: m});
  },
  H = re;
var se = (e, r, t) =>
    H({...v, ...e}, async (o, s, i, n) => {
      let {port: a, host: p, nodeEnv: d, basepath: l, appName: S = 'HuxyServer', protocol: L} = o;
      if (!t) {
        let U = f()
          .filter(T => T !== p)
          .map(T => `${L}://${T}:${a}${l}`);
        (n.info($(S)),
          n.info(`\u{1F680} \u670D\u52A1\u8FD0\u884C\u5728\u3010${d}\u3011\u73AF\u5883: ${L}://${p}:${a}${l}`),
          n.info(`-----------------[${c()}]------------------`),
          n.info({ips: U}, '\u672C\u5730\u5730\u5740\uFF1A'));
      }
      await r?.(o, s, i, n);
    }),
  x = se;
import ce from 'express';
import {fileURLToPath as ne} from 'node:url';
import {dirname as ie, resolve as ae} from 'node:path';
var I = (e = import.meta.url) => ie(ne(e)),
  P = (...e) => ae(I(), ...e),
  k = P;
var pe = {port: 9e3, host: 'localhost', basepath: '/', buildPath: './build'},
  me = (e, r) =>
    x({...pe, ...e}, async (t, o, s, i) => {
      await r?.(t, o, s, i);
      let {basepath: n, buildPath: a} = t;
      (n !== '/' &&
        o.get('/', (d, l, S) => {
          if (d.path === '/' || d.path === n.slice(0, -1)) return l.redirect(n);
          S();
        }),
        o.use(n, ce.static(a, {...t.staticCache})));
      let p = new RegExp(`^${n.replace(/\//g, '\\/')}(.*)$`);
      o.get(p, (d, l) => {
        l.sendFile(k(a, 'index.html'));
      });
    }),
  C = me;
var ot = {startServer: x, startStatic: C, logger: m, createLogger: u, dateTime: c, localIPs: f, nodeArgs: E, getEnvConfig: h, checkPort: g, getDirName: I, resolvePath: P};
export {
  g as checkPort,
  u as createLogger,
  c as dateTime,
  ot as default,
  I as getDirName,
  h as getEnvConfig,
  f as localIPs,
  m as logger,
  E as nodeArgs,
  P as resolvePath,
  x as startServer,
  C as startStatic,
};
