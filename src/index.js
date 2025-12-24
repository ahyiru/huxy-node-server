import P from 'express';
import K from 'helmet';
import z from 'cors';
import {rateLimit as B, ipKeyGenerator as X} from 'express-rate-limit';
import Q from 'compression';
import J from 'pino-http';
import {createServer as Y} from 'node:http';
import L from 'pino';
import k from 'node:os';
import C from 'node:net';
var c = (e = new Date()) => e.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  f = e => {
    let o = e ? 'https' : 'http',
      t = k.networkInterfaces(),
      s = [];
    return (Object.keys(t).map(n => s.push(...t[n])), s.filter(n => n.family === 'IPv4').map(n => `${o}://${n.address}`));
  },
  S = e => {
    let o = e ?? process.argv.slice(2) ?? [],
      t = {};
    return (
      o.map(s => {
        let [r, i] = s.split('=');
        t[r] = i;
      }),
      t
    );
  },
  U = {
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
  G = (e, o, t) => {
    let [s, r] = e.split('.');
    s && r ? (t[s] || (t[s] = {}), (t[s][r] = o)) : (t[s] = o);
  },
  j = e => (e ? (e.endsWith('/') ? e : `${e}/`) : '/'),
  h = (e = {}, o = U) => {
    let {env: t} = process;
    Object.keys(o).map(r => {
      let i = t[r] ?? e[r];
      i && G(o[r], i, e);
    });
    let s = {...e, ...S()};
    return ((s.port = s.staticPort || s.port), (s.isDev = s.NODE_ENV === 'development'), (s.basepath = j(s.basepath)), s);
  },
  g = (e, o = '127.0.0.1') =>
    new Promise(t => {
      let s = C.createServer();
      (s.once('error', r => {
        (s.close(), t((r.code === 'EADDRINUSE', !1)));
      }),
        s.once('listening', () => {
          (s.close(), t(!0));
        }),
        s.listen(Number(e), o));
    }),
  w = (e, o = {}, t) => {
    let s = r => {
      (t.warn(`\u6536\u5230 ${r} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        e.close(async () => {
          (t.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), await o.shutdown?.(), process.exit(0));
        }),
        setTimeout(() => {
          (t.error('\u274C \u5F3A\u5236\u5173\u95ED\u670D\u52A1\u5668'), process.exit(1));
        }, 5e3));
    };
    (process.on('SIGTERM', () => s('SIGTERM')),
      process.on('SIGINT', () => s('SIGINT')),
      process.on('uncaughtException', r => {
        (t.fatal(r, `\u{1F4A5} \u672A\u6355\u83B7\u7684\u5F02\u5E38: ${r.message}`), process.exit(1));
      }),
      process.on('unhandledRejection', (r, i) => {
        (t.fatal({reason: r, promise: i}, '\u26A0\uFE0F \u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'), process.exit(1));
      }));
  },
  A = (e, {port: o, host: t = '0.0.0.0'} = {}) =>
    new Promise((s, r) => {
      let i = p => {
          (a(), r(p));
        },
        n = () => {
          (a(), s(e));
        },
        a = () => {
          (e.off('error', i), e.off('listening', n));
        };
      (e.once('error', i), e.once('listening', n), e.listen(o, t));
    });
import 'dotenv';
var F = {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    basepath: process.env.BASEPATH || '/',
    apiPrefix: '/api',
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
  v = F;
var d = (e, o) =>
  L({
    name: e,
    level: v.logLevel,
    formatters: {level: t => ({level: t})},
    timestamp: L.stdTimeFunctions.isoTime,
    base: null,
    transport: {target: 'pino-pretty', options: {colorize: !0, sync: !0, levelFirst: !0}, ignore: 'pid,hostname,level,time', translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'},
    ...o,
  });
var m = d('huxy');
var R = d('error-handler'),
  $ = e => (o, t, s) => {
    (R.error({message: 'Not Found', timestamp: c(), url: o.originalUrl, method: o.method, ip: o.ip, userAgent: o.get('User-Agent')}, '\u627E\u4E0D\u5230\u8DEF\u5F84'),
      t.status(404).json({success: !1, status: 404, url: o.originalUrl, message: `\u8DEF\u7531 [${o.method} ${o.originalUrl}] \u4E0D\u5B58\u5728`, timestamp: c()}));
  },
  b = e => (o, t, s, r) => {
    let i = o.status || 500,
      n = o.message;
    (R.error({message: n, timestamp: c(), stack: o.stack, url: t.originalUrl, method: t.method, ip: t.ip, userAgent: t.get('User-Agent')}, '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF'),
      s.status(i).json({success: !1, message: (e.isDev, n), stack: e.isDev ? o.stack : void 0, timestamp: c()}));
  };
var N = e => (o, t, s) => {
  (t.set('Cache-Control', `public, max-age=${e.cacheMaxAge ?? 300}, stale-while-revalidate=60`), s());
};
import {Router as V} from 'express';
var W = e => {
    let o = V();
    return (
      o.use('/health', (t, s) => {
        s.status(200).json({status: 'OK', timestamp: c(), environment: e.nodeEnv, uptime: process.uptime(), memoryUsage: process.memoryUsage(), pid: process.pid});
      }),
      o.get('/', (t, s) => {
        s.status(200).json({message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D', timestamp: c(), environment: e.nodeEnv});
      }),
      o
    );
  },
  _ = W;
var Z = (e, o = {}) => {
    (e.disable('x-powered-by'),
      e.set('trust proxy', 1),
      e.use(J({logger: m, quietReqLogger: !0, autoLogging: !1, genReqId: !1})),
      e.use(Q()),
      e.use(K(o.helmet)),
      e.use(z(o.cors)),
      e.use(o.apiPrefix, B({keyGenerator: t => X(t.ip) || t.headers['x-huxy-auth'] || t.headers['x-api-key'] || t.headers.authorization, ...o.rateLimit})),
      e.use(P.json({limit: '20mb'})),
      e.use(P.urlencoded({extended: !0, limit: '20mb'})),
      e.use(o.apiPrefix, N(o)));
  },
  q = (e, o = {}) => {
    (e.use(_(o)), e.use($(o)), e.use(b(o)));
  },
  ee = async (e, o) => {
    let t = h(e),
      {port: s} = t;
    (await g(s, t.host)) || ((t.port = Number(s) + 1), m.warn(`\u7AEF\u53E3 ${s} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${t.port}`));
    let i = P();
    Z(i, t);
    let n = Y(i);
    w(n, t, m);
    try {
      await A(n, t);
    } catch (a) {
      (m.error({err: a}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25'), process.exit(1));
    }
    try {
      await o?.(t, i, n, m);
    } catch (a) {
      (m.error({err: a}, `\u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${a.message}`), process.exit(1));
    }
    return (q(i, t), {app: i, httpServer: n, config: t, logger: m});
  },
  O = ee;
var te = (e, o = 56) => {
    let t = e.length,
      s = o - t,
      r = ~~(s / 2);
    return `${'-'.repeat(r)}${e}${'-'.repeat(s - r)}`;
  },
  oe = (e, o, t) =>
    O({...v, ...e}, async (s, r, i, n) => {
      let {port: a, host: p, nodeEnv: u, basepath: l, appName: E = 'HuxyServer'} = s;
      if (!t) {
        let H = f()
          .filter(T => T !== `http://${p}`)
          .map(T => `http://${T}:${a}${l}`);
        (n.info(te(E)),
          n.info(`\u{1F680} \u670D\u52A1\u8FD0\u884C\u5728\u3010${u}\u3011\u73AF\u5883: http://${p}:${a}${l}`),
          n.info(`-----------------[${c()}]------------------`),
          n.info({ips: H}, '\u672C\u5730\u5730\u5740\uFF1A'));
      }
      await o?.(s, r, i, n);
    }),
  x = oe;
import ie from 'express';
import {fileURLToPath as se} from 'node:url';
import {dirname as re, resolve as ne} from 'node:path';
var I = (e = import.meta.url) => re(se(e)),
  y = (...e) => ne(I(), ...e),
  M = y;
var ae = {port: 9e3, host: 'localhost', basepath: '/', buildPath: './build'},
  ce = (e, o) =>
    x({...ae, ...e}, async (t, s, r, i) => {
      await o?.(t, s, r, i);
      let {basepath: n, buildPath: a} = t;
      (s.get('/', (u, l, E) => {
        ((u.path === '/' || u.path === n.slice(0, -1)) && l.redirect(n), E());
      }),
        s.use(n, ie.static(a, {})));
      let p = new RegExp(`^${n.replace(/\//g, '\\/')}(.*)$`);
      s.get(p, (u, l) => {
        l.sendFile(M(a, 'index.html'));
      });
    }),
  D = ce;
var qe = {startServer: x, startStatic: D, logger: m, createLogger: d, dateTime: c, localIPs: f, nodeArgs: S, getEnvConfig: h, checkPort: g, getDirName: I, resolvePath: y};
export {
  g as checkPort,
  d as createLogger,
  c as dateTime,
  qe as default,
  I as getDirName,
  h as getEnvConfig,
  f as localIPs,
  m as logger,
  S as nodeArgs,
  y as resolvePath,
  x as startServer,
  D as startStatic,
};
