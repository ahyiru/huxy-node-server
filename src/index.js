import I from 'express';
import K from 'helmet';
import z from 'cors';
import {rateLimit as B, ipKeyGenerator as X} from 'express-rate-limit';
import Q from 'compression';
import J from 'pino-http';
import {createServer as Y} from 'node:http';
import R from 'pino';
import k from 'node:os';
import C from 'node:net';
var c = (e = new Date()) => e.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  f = e => {
    let r = e ? 'https' : 'http',
      t = k.networkInterfaces(),
      o = [];
    return (Object.keys(t).map(n => o.push(...t[n])), o.filter(n => n.family === 'IPv4').map(n => `${r}://${n.address}`));
  },
  S = e => {
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
  G = (e, r, t) => {
    let [o, s] = e.split('.');
    o && s ? (t[o] || (t[o] = {}), (t[o][s] = r)) : (t[o] = r);
  },
  j = e => (e ? (e.endsWith('/') ? e : `${e}/`) : '/'),
  h = (e = {}, r = U) => {
    let {env: t} = process;
    Object.keys(r).map(s => {
      let i = t[s] ?? e[s];
      i && G(r[s], i, e);
    });
    let o = {...e, ...S()};
    return ((o.port = o.staticPort || o.port), (o.isDev = o.NODE_ENV === 'development'), (o.basepath = j(o.basepath)), o);
  },
  g = (e, r = '127.0.0.1') =>
    new Promise(t => {
      let o = C.createServer();
      (o.once('error', s => {
        (o.close(), t((s.code === 'EADDRINUSE', !1)));
      }),
        o.once('listening', () => {
          (o.close(), t(!0));
        }),
        o.listen(Number(e), r));
    }),
  L = (e, r = {}, t) => {
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
  w = (e, {port: r, host: t = '0.0.0.0'} = {}) =>
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
  A = (e, r = 56) => {
    let t = e.length,
      o = r - t,
      s = ~~(o / 2);
    return `${'-'.repeat(s)}${e}${'-'.repeat(o - s)}`;
  };
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
var d = (e, r) =>
  R({
    name: e,
    level: v.logLevel,
    formatters: {level: t => ({level: t})},
    timestamp: R.stdTimeFunctions.isoTime,
    base: null,
    transport: {target: 'pino-pretty', options: {colorize: !0, sync: !0, levelFirst: !0}, ignore: 'pid,hostname,level,time', translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'},
    ...r,
  });
var m = d('huxy');
var $ = d('error-handler'),
  b = e => (r, t, o) => {
    ($.error({message: 'Not Found', timestamp: c(), url: r.originalUrl, method: r.method, ip: r.ip, userAgent: r.get('User-Agent')}, '\u627E\u4E0D\u5230\u8DEF\u5F84'),
      t.status(404).json({success: !1, status: 404, url: r.originalUrl, message: `\u8DEF\u7531 [${r.method} ${r.originalUrl}] \u4E0D\u5B58\u5728`, timestamp: c()}));
  },
  N = e => (r, t, o, s) => {
    let i = r.status || 500,
      n = r.message;
    ($.error({message: n, timestamp: c(), stack: r.stack, url: t.originalUrl, method: t.method, ip: t.ip, userAgent: t.get('User-Agent')}, '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF'),
      o.status(i).json({success: !1, message: (e.isDev, n), stack: e.isDev ? r.stack : void 0, timestamp: c()}));
  };
import {Router as V} from 'express';
var W = e => {
    let r = V();
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
  _ = W;
var Z = (e, r = {}) => {
    (e.disable('x-powered-by'),
      e.set('trust proxy', 1),
      e.use(J({logger: m, quietReqLogger: !0, autoLogging: !1, genReqId: !1})),
      e.use(Q()),
      e.use(K(r.helmet)),
      e.use(z(r.cors)),
      e.use(r.apiPrefix, B({keyGenerator: t => X(t.ip) || t.headers['x-huxy-auth'] || t.headers['x-api-key'] || t.headers.authorization, ...r.rateLimit})),
      e.use(I.json({limit: '20mb'})),
      e.use(I.urlencoded({extended: !0, limit: '20mb'})));
  },
  q = (e, r = {}) => {
    (e.use(_(r)), e.use(b(r)), e.use(N(r)));
  },
  ee = async (e, r) => {
    let t = h(e),
      {port: o} = t;
    (await g(o, t.host)) || ((t.port = Number(o) + 1), m.warn(`\u7AEF\u53E3 ${o} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${t.port}`));
    let i = I();
    Z(i, t);
    let n = Y(i);
    L(n, t, m);
    try {
      await w(n, t);
    } catch (a) {
      (m.error({err: a}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25'), process.exit(1));
    }
    try {
      await r?.(t, i, n, m);
    } catch (a) {
      (m.error({err: a}, `\u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${a.message}`), process.exit(1));
    }
    return (q(i, t), {app: i, httpServer: n, config: t, logger: m});
  },
  O = ee;
var te = (e, r, t) =>
    O({...v, ...e}, async (o, s, i, n) => {
      let {port: a, host: p, nodeEnv: u, basepath: l, appName: E = 'HuxyServer'} = o;
      if (!t) {
        let H = f()
          .filter(T => T !== `http://${p}`)
          .map(T => `http://${T}:${a}${l}`);
        (n.info(A(E)),
          n.info(`\u{1F680} \u670D\u52A1\u8FD0\u884C\u5728\u3010${u}\u3011\u73AF\u5883: http://${p}:${a}${l}`),
          n.info(`-----------------[${c()}]------------------`),
          n.info({ips: H}, '\u672C\u5730\u5730\u5740\uFF1A'));
      }
      await r?.(o, s, i, n);
    }),
  x = te;
import ne from 'express';
import {fileURLToPath as oe} from 'node:url';
import {dirname as re, resolve as se} from 'node:path';
var P = (e = import.meta.url) => re(oe(e)),
  y = (...e) => se(P(), ...e),
  D = y;
var ie = {port: 9e3, host: 'localhost', basepath: '/', buildPath: './build'},
  ae = (e, r) =>
    x({...ie, ...e}, async (t, o, s, i) => {
      await r?.(t, o, s, i);
      let {basepath: n, buildPath: a} = t;
      (n !== '/' &&
        o.get('/', (u, l, E) => {
          if (u.path === '/' || u.path === n.slice(0, -1)) return l.redirect(n);
          E();
        }),
        o.use(n, ne.static(a, {...t.staticCache})));
      let p = new RegExp(`^${n.replace(/\//g, '\\/')}(.*)$`);
      o.get(p, (u, l) => {
        l.sendFile(D(a, 'index.html'));
      });
    }),
  M = ae;
var Ze = {startServer: x, startStatic: M, logger: m, createLogger: d, dateTime: c, localIPs: f, nodeArgs: S, getEnvConfig: h, checkPort: g, getDirName: P, resolvePath: y};
export {
  g as checkPort,
  d as createLogger,
  c as dateTime,
  Ze as default,
  P as getDirName,
  h as getEnvConfig,
  f as localIPs,
  m as logger,
  S as nodeArgs,
  y as resolvePath,
  x as startServer,
  M as startStatic,
};
