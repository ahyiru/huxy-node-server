import L from 'express';
import B from 'helmet';
import X from 'cors';
import {rateLimit as Q, ipKeyGenerator as J} from 'express-rate-limit';
import Y from 'compression';
import Z from 'pino-http';
import {createServer as C} from 'node:http';
import q from 'node:https';
import b from 'pino';
import j from 'node:os';
import G from 'node:net';
var c = (e = new Date()) => e.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  w = e => Object.prototype.toString.call(e).slice(8, -1).toLowerCase(),
  g = e => {
    let r = e ? 'https' : 'http',
      o = j.networkInterfaces(),
      t = [];
    return (Object.keys(o).map(n => t.push(...o[n])), t.filter(n => n.family === 'IPv4').map(n => n.address));
  },
  y = e => {
    let r = e ?? process.argv.slice(2) ?? [],
      o = {};
    return (
      r.map(t => {
        let [s, n] = t.split('=');
        o[s] = n;
      }),
      o
    );
  },
  F = {
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
  V = (e, r, o) => {
    let [t, s] = e.split('.');
    t && s ? (o[t] || (o[t] = {}), (o[t][s] = r)) : (o[t] = r);
  },
  v = (e = {}, r = F) => {
    let {env: o} = process;
    Object.keys(r).map(s => {
      let n = o[s] ?? e[s];
      n && V(r[s], n, e);
    });
    let t = {...e, ...y()};
    return ((t.port = t.staticPort || t.port), (t.isDev = t.nodeEnv === 'development'), (t.protocol = 'http'), t);
  },
  x = (e, r = '127.0.0.1') =>
    new Promise(o => {
      let t = G.createServer();
      (t.once('error', s => {
        (t.close(), o((s.code === 'EADDRINUSE', !1)));
      }),
        t.once('listening', () => {
          (t.close(), o(!0));
        }),
        t.listen(Number(e), r));
    }),
  A = (e, r = {}, o) => {
    let t = s => {
      (o.warn(`\u6536\u5230 ${s} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        e.close(async () => {
          (o.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), await r.shutdown?.(), process.exit(0));
        }),
        setTimeout(() => {
          (o.error('\u274C \u5F3A\u5236\u5173\u95ED\u670D\u52A1\u5668'), process.exit(1));
        }, 5e3));
    };
    (process.on('SIGTERM', () => t('SIGTERM')),
      process.on('SIGINT', () => t('SIGINT')),
      process.on('uncaughtException', s => {
        (o.fatal(s, `\u{1F4A5} \u672A\u6355\u83B7\u7684\u5F02\u5E38: ${s.message}`), process.exit(1));
      }),
      process.on('unhandledRejection', (s, n) => {
        (o.fatal({reason: s, promise: n}, '\u26A0\uFE0F \u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'), process.exit(1));
      }));
  },
  $ = (e, {port: r, host: o = '0.0.0.0'} = {}) =>
    new Promise((t, s) => {
      let n = a => {
          (p(), s(a));
        },
        i = () => {
          (p(), t(e));
        },
        p = () => {
          (e.off('error', n), e.off('listening', i));
        };
      (e.once('error', n), e.once('listening', i), e.listen(r, o));
    }),
  R = (e, r = 56) => {
    let o = e.length,
      t = r - o,
      s = ~~(t / 2);
    return `${'-'.repeat(s)}${e}${'-'.repeat(t - s)}`;
  };
import 'dotenv';
var W = {
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
  S = W;
var f = (e, {transportOpt: r, ...o} = {}) =>
  b({
    name: e,
    level: S.logLevel,
    formatters: {level: t => ({level: t})},
    timestamp: b.stdTimeFunctions.isoTime,
    base: null,
    transport: {target: 'pino-pretty', options: {colorize: !0, levelFirst: !0, ...r}, ignore: 'pid,hostname,level,time', translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'},
    ...o,
  });
var h = f;
var O = f('error-handler'),
  N = e => (r, o, t) => {
    (O.error({message: 'Not Found', timestamp: c(), url: r.originalUrl, method: r.method, ip: r.ip, userAgent: r.get('User-Agent')}, '\u627E\u4E0D\u5230\u8DEF\u5F84'),
      o.status(404).json({success: !1, status: 404, url: r.originalUrl, message: `\u8DEF\u7531 [${r.method} ${r.originalUrl}] \u4E0D\u5B58\u5728`, timestamp: c()}));
  },
  _ = e => (r, o, t, s) => {
    let n = r.status || 500,
      i = r.message;
    (O.error({message: i, timestamp: c(), stack: r.stack, url: o.originalUrl, method: o.method, ip: o.ip, userAgent: o.get('User-Agent')}, '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF'),
      t.status(n).json({success: !1, message: (e.isDev, i), stack: e.isDev ? r.stack : void 0, timestamp: c()}));
  };
import {Router as K} from 'express';
var z = e => {
    let r = K();
    return (
      r.use('/health', (o, t) => {
        t.status(200).json({status: 'OK', timestamp: c(), environment: e.nodeEnv, uptime: process.uptime(), memoryUsage: process.memoryUsage(), pid: process.pid});
      }),
      r.get('/', (o, t) => {
        t.status(200).json({message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D', timestamp: c(), environment: e.nodeEnv});
      }),
      r
    );
  },
  M = z;
var ee = (e, r = {}, o) => {
    (e.disable('x-powered-by'),
      e.set('trust proxy', r.trustProxy ?? 1),
      e.use(Z({logger: o, quietReqLogger: !0, autoLogging: !1, genReqId: !1})),
      e.use(Y()),
      e.use(B(r.helmet)),
      e.use(X(r.cors)),
      e.use(r.apiPrefix, Q({keyGenerator: t => J(t.ip) || t.headers['x-huxy-auth'] || t.headers['x-api-key'] || t.headers.authorization, ...r.rateLimit})),
      e.use(L.json({limit: '20mb'})),
      e.use(L.urlencoded({extended: !0, limit: '20mb'})));
  },
  te = (e, r = {}) => {
    (e.use(M(r)), e.use(N(r)), e.use(_(r)));
  },
  oe = async (e = {}, r) => {
    let o = h(e.loggerName || 'huxy', e.loggerConfig),
      t = h('http-request', e.loggerConfig),
      s = v(e),
      {port: n, ssl: i} = s;
    (await x(n, s.host)) || ((s.port = Number(n) + 1), o.warn(`\u7AEF\u53E3 ${n} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${s.port}`));
    let a = L();
    ee(a, s, t);
    let l;
    (i
      ? (w(i) === 'object' ||
          (o.error({ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}}, '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}'), process.exit(1)),
        (s.protocol = 'https'),
        (l = q.createServer(i, a)),
        C((d, u) => {
          (u.writeHead(301, {Location: `${s.protocol}://${d.headers.host}${d.url}`}), u.end());
        }).listen(80))
      : (l = C(a)),
      A(l, s, o));
    try {
      await $(l, s);
    } catch (m) {
      (o.error({err: m}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25'), process.exit(1));
    }
    try {
      await r?.(s, a, l, o);
    } catch (m) {
      (o.error({err: m}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${m.message}`), process.exit(1));
    }
    return (te(a, s), {app: a, httpServer: l, config: s, logger: o});
  },
  D = oe;
var re = (e, r, o) =>
    D({...S, ...e}, async (t, s, n, i) => {
      let {port: p, host: a, nodeEnv: l, basepath: m, appName: d = 'HuxyServer', protocol: u} = t;
      if (!o) {
        let U = g()
          .filter(E => E !== a)
          .map(E => `${u}://${E}:${p}${m}`);
        (i.info(R(d)),
          i.info(`\u{1F680} \u670D\u52A1\u8FD0\u884C\u5728\u3010${l}\u3011\u73AF\u5883: ${u}://${a}:${p}${m}`),
          i.info(`-----------------[${c()}]------------------`),
          i.info({ips: U}, '\u672C\u5730\u5730\u5740\uFF1A'));
      }
      await r?.(t, s, n, i);
    }),
  T = re;
import ae from 'express';
import {fileURLToPath as se} from 'node:url';
import {dirname as ne, resolve as ie} from 'node:path';
var P = (e = import.meta.url) => ne(se(e)),
  I = (...e) => ie(P(), ...e),
  H = I;
var ce = {port: 9e3, host: 'localhost', basepath: '/', buildPath: './build'},
  me = e => (e ? (e.endsWith('/') ? e : `${e}/`) : '/'),
  pe = (e, r) =>
    T({...ce, ...e}, async (o, t, s, n) => {
      await r?.(o, t, s, n);
      let {basepath: i, buildPath: p} = o;
      (i !== '/' &&
        t.get('/', (m, d, u) => {
          if (m.path === '/') return d.redirect(i);
          u();
        }),
        t.use(i, ae.static(p, {...o.staticCache})));
      let a = me(i),
        l = new RegExp(`^${a.replace(/\//g, '\\/')}(.*)$`);
      t.get(l, (m, d) => {
        d.sendFile(H(p, 'index.html'));
      });
    }),
  k = pe;
var ot = {startServer: T, startStatic: k, logger: h, createLogger: f, dateTime: c, localIPs: g, nodeArgs: y, getEnvConfig: v, checkPort: x, getDirName: P, resolvePath: I};
export {
  x as checkPort,
  f as createLogger,
  c as dateTime,
  ot as default,
  P as getDirName,
  v as getEnvConfig,
  g as localIPs,
  h as logger,
  y as nodeArgs,
  I as resolvePath,
  T as startServer,
  k as startStatic,
};
