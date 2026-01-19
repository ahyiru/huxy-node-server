import P from 'express';
import B from 'helmet';
import X from 'cors';
import {rateLimit as Q, ipKeyGenerator as J} from 'express-rate-limit';
import Y from 'compression';
import Z from 'pino-http';
import {createServer as M} from 'node:http';
import q from 'node:https';
import b from 'pino';
import j from 'node:os';
import G from 'node:net';
var c = (e = new Date()) => e.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  w = e => Object.prototype.toString.call(e).slice(8, -1).toLowerCase(),
  g = e => {
    let o = e ? 'https' : 'http',
      t = j.networkInterfaces(),
      r = [];
    return (Object.keys(t).map(i => r.push(...t[i])), r.filter(i => i.family === 'IPv4').map(i => i.address));
  },
  y = e => {
    let o = e ?? process.argv.slice(2) ?? [],
      t = {};
    return (
      o.map(r => {
        let [s, i] = r.split('=');
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
  F = (e, o, t) => {
    let [r, s] = e.split('.');
    r && s ? (t[r] || (t[r] = {}), (t[r][s] = o)) : (t[r] = o);
  },
  v = (e = {}, o = V) => {
    let {env: t} = process;
    Object.keys(o).map(s => {
      let i = t[s] ?? e[s];
      i && F(o[s], i, e);
    });
    let r = {...e, ...y()};
    return ((r.port = r.staticPort || r.port), (r.isDev = r.NODE_ENV === 'development'), (r.protocol = 'http'), r);
  },
  x = (e, o = '127.0.0.1') =>
    new Promise(t => {
      let r = G.createServer();
      (r.once('error', s => {
        (r.close(), t((s.code === 'EADDRINUSE', !1)));
      }),
        r.once('listening', () => {
          (r.close(), t(!0));
        }),
        r.listen(Number(e), o));
    }),
  A = (e, o = {}, t) => {
    let r = s => {
      (t.warn(`\u6536\u5230 ${s} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        e.close(async () => {
          (t.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), await o.shutdown?.(), process.exit(0));
        }),
        setTimeout(() => {
          (t.error('\u274C \u5F3A\u5236\u5173\u95ED\u670D\u52A1\u5668'), process.exit(1));
        }, 5e3));
    };
    (process.on('SIGTERM', () => r('SIGTERM')),
      process.on('SIGINT', () => r('SIGINT')),
      process.on('uncaughtException', s => {
        (t.fatal(s, `\u{1F4A5} \u672A\u6355\u83B7\u7684\u5F02\u5E38: ${s.message}`), process.exit(1));
      }),
      process.on('unhandledRejection', (s, i) => {
        (t.fatal({reason: s, promise: i}, '\u26A0\uFE0F \u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'), process.exit(1));
      }));
  },
  $ = (e, {port: o, host: t = '0.0.0.0'} = {}) =>
    new Promise((r, s) => {
      let i = m => {
          (a(), s(m));
        },
        n = () => {
          (a(), r(e));
        },
        a = () => {
          (e.off('error', i), e.off('listening', n));
        };
      (e.once('error', i), e.once('listening', n), e.listen(o, t));
    }),
  R = (e, o = 56) => {
    let t = e.length,
      r = o - t,
      s = ~~(r / 2);
    return `${'-'.repeat(s)}${e}${'-'.repeat(r - s)}`;
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
var f = (e, o) =>
  b({
    name: e,
    level: S.logLevel,
    formatters: {level: t => ({level: t})},
    timestamp: b.stdTimeFunctions.isoTime,
    base: null,
    transport: {target: 'pino-pretty', options: {colorize: !0, sync: !0, levelFirst: !0}, ignore: 'pid,hostname,level,time', translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'},
    ...o,
  });
var p = f('huxy');
var O = f('error-handler'),
  N = e => (o, t, r) => {
    (O.error({message: 'Not Found', timestamp: c(), url: o.originalUrl, method: o.method, ip: o.ip, userAgent: o.get('User-Agent')}, '\u627E\u4E0D\u5230\u8DEF\u5F84'),
      t.status(404).json({success: !1, status: 404, url: o.originalUrl, message: `\u8DEF\u7531 [${o.method} ${o.originalUrl}] \u4E0D\u5B58\u5728`, timestamp: c()}));
  },
  _ = e => (o, t, r, s) => {
    let i = o.status || 500,
      n = o.message;
    (O.error({message: n, timestamp: c(), stack: o.stack, url: t.originalUrl, method: t.method, ip: t.ip, userAgent: t.get('User-Agent')}, '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF'),
      r.status(i).json({success: !1, message: (e.isDev, n), stack: e.isDev ? o.stack : void 0, timestamp: c()}));
  };
import {Router as K} from 'express';
var z = e => {
    let o = K();
    return (
      o.use('/health', (t, r) => {
        r.status(200).json({status: 'OK', timestamp: c(), environment: e.nodeEnv, uptime: process.uptime(), memoryUsage: process.memoryUsage(), pid: process.pid});
      }),
      o.get('/', (t, r) => {
        r.status(200).json({message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D', timestamp: c(), environment: e.nodeEnv});
      }),
      o
    );
  },
  D = z;
var ee = (e, o = {}) => {
    (e.disable('x-powered-by'),
      e.set('trust proxy', o.trustProxy ?? 1),
      e.use(Z({logger: p, quietReqLogger: !0, autoLogging: !1, genReqId: !1})),
      e.use(Y()),
      e.use(B(o.helmet)),
      e.use(X(o.cors)),
      e.use(o.apiPrefix, Q({keyGenerator: t => J(t.ip) || t.headers['x-huxy-auth'] || t.headers['x-api-key'] || t.headers.authorization, ...o.rateLimit})),
      e.use(P.json({limit: '20mb'})),
      e.use(P.urlencoded({extended: !0, limit: '20mb'})));
  },
  te = (e, o = {}) => {
    (e.use(D(o)), e.use(N(o)), e.use(_(o)));
  },
  oe = async (e, o) => {
    let t = v(e),
      {port: r, ssl: s} = t;
    (await x(r, t.host)) || ((t.port = Number(r) + 1), p.warn(`\u7AEF\u53E3 ${r} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${t.port}`));
    let n = P();
    ee(n, t);
    let a;
    (s
      ? (w(s) === 'object' ||
          (p.error({ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}}, '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}'), process.exit(1)),
        (t.protocol = 'https'),
        (a = q.createServer(s, n)),
        M((d, l) => {
          (l.writeHead(301, {Location: `${t.protocol}://${d.headers.host}${d.url}`}), l.end());
        }).listen(80))
      : (a = M(n)),
      A(a, t, p));
    try {
      await $(a, t);
    } catch (m) {
      (p.error({err: m}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25'), process.exit(1));
    }
    try {
      await o?.(t, n, a, p);
    } catch (m) {
      (p.error({err: m}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${m.message}`), process.exit(1));
    }
    return (te(n, t), {app: n, httpServer: a, config: t, logger: p});
  },
  H = oe;
var re = (e, o, t) =>
    H({...S, ...e}, async (r, s, i, n) => {
      let {port: a, host: m, nodeEnv: d, basepath: l, appName: u = 'HuxyServer', protocol: h} = r;
      if (!t) {
        let U = g()
          .filter(E => E !== m)
          .map(E => `${h}://${E}:${a}${l}`);
        (n.info(R(u)),
          n.info(`\u{1F680} \u670D\u52A1\u8FD0\u884C\u5728\u3010${d}\u3011\u73AF\u5883: ${h}://${m}:${a}${l}`),
          n.info(`-----------------[${c()}]------------------`),
          n.info({ips: U}, '\u672C\u5730\u5730\u5740\uFF1A'));
      }
      await o?.(r, s, i, n);
    }),
  T = re;
import ae from 'express';
import {fileURLToPath as se} from 'node:url';
import {dirname as ne, resolve as ie} from 'node:path';
var I = (e = import.meta.url) => ne(se(e)),
  L = (...e) => ie(I(), ...e),
  k = L;
var ce = {port: 9e3, host: 'localhost', basepath: '/', buildPath: './build'},
  me = e => (e ? (e.endsWith('/') ? e : `${e}/`) : '/'),
  pe = (e, o) =>
    T({...ce, ...e}, async (t, r, s, i) => {
      await o?.(t, r, s, i);
      let {basepath: n, buildPath: a} = t;
      (n !== '/' &&
        r.get('/', (l, u, h) => {
          if (l.path === '/') return u.redirect(n);
          h();
        }),
        r.use(n, ae.static(a, {...t.staticCache})));
      let m = me(n),
        d = new RegExp(`^${m.replace(/\//g, '\\/')}(.*)$`);
      r.get(d, (l, u) => {
        u.sendFile(k(a, 'index.html'));
      });
    }),
  C = pe;
var ot = {startServer: T, startStatic: C, logger: p, createLogger: f, dateTime: c, localIPs: g, nodeArgs: y, getEnvConfig: v, checkPort: x, getDirName: I, resolvePath: L};
export {
  x as checkPort,
  f as createLogger,
  c as dateTime,
  ot as default,
  I as getDirName,
  v as getEnvConfig,
  g as localIPs,
  p as logger,
  y as nodeArgs,
  L as resolvePath,
  T as startServer,
  C as startStatic,
};
