import S from 'express';
import K from 'helmet';
import z from 'cors';
import {rateLimit as B, ipKeyGenerator as X} from 'express-rate-limit';
import Q from 'compression';
import J from 'pino-http';
import {createServer as Y} from 'node:http';
import A from 'pino';
import k from 'node:os';
import C from 'node:net';
var c = (e = new Date()) => e.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  d = e => {
    let o = e ? 'https' : 'http',
      t = k.networkInterfaces(),
      r = [];
    return (Object.keys(t).map(n => r.push(...t[n])), r.filter(n => n.family === 'IPv4').map(n => `${o}://${n.address}`));
  },
  T = e => {
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
    let [r, s] = e.split('.');
    r && s ? (t[r] || (t[r] = {}), (t[r][s] = o)) : (t[r] = o);
  },
  j = e => (e ? (e.endsWith('/') ? e : `${e}/`) : '/'),
  f = (e = {}, o = U) => {
    let {env: t} = process;
    Object.keys(o).map(s => {
      let i = t[s] ?? e[s];
      i && G(o[s], i, e);
    });
    let r = {...e, ...T()};
    return ((r.port = r.staticPort || r.port), (r.isDev = r.NODE_ENV === 'development'), (r.basepath = j(r.basepath)), r);
  },
  h = (e, o = '127.0.0.1') =>
    new Promise(t => {
      let r = C.createServer();
      (r.once('error', s => {
        (r.close(), t((s.code === 'EADDRINUSE', !1)));
      }),
        r.once('listening', () => {
          (r.close(), t(!0));
        }),
        r.listen(Number(e), o));
    }),
  y = (e, o = {}, t) => {
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
  w = (e, {port: o, host: t = '0.0.0.0'} = {}) =>
    new Promise((r, s) => {
      let i = p => {
          (a(), s(p));
        },
        n = () => {
          (a(), r(e));
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
  g = F;
var u = (e, o) =>
  A({
    name: e,
    level: g.logLevel,
    formatters: {level: t => ({level: t})},
    timestamp: A.stdTimeFunctions.isoTime,
    base: null,
    transport: {target: 'pino-pretty', options: {colorize: !0, sync: !0, levelFirst: !0}, ignore: 'pid,hostname,level,time', translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'},
    ...o,
  });
var m = u('huxy');
var L = u('error-handler'),
  R = e => (o, t, r) => {
    (L.error({message: 'Not Found', timestamp: c(), url: o.originalUrl, method: o.method, ip: o.ip, userAgent: o.get('User-Agent')}, '\u627E\u4E0D\u5230\u8DEF\u5F84'),
      t.status(404).json({success: !1, status: 404, url: o.originalUrl, message: `\u8DEF\u7531 [${o.method} ${o.originalUrl}] \u4E0D\u5B58\u5728`, timestamp: c()}));
  },
  $ = e => (o, t, r, s) => {
    let i = o.status || 500,
      n = o.message;
    (L.error({message: n, timestamp: c(), stack: o.stack, url: t.originalUrl, method: t.method, ip: t.ip, userAgent: t.get('User-Agent')}, '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF'),
      r.status(i).json({success: !1, message: (e.isDev, n), stack: e.isDev ? o.stack : void 0, timestamp: c()}));
  };
var b = e => (o, t, r) => {
  (t.set('Cache-Control', `public, max-age=${e.cacheMaxAge ?? 300}, stale-while-revalidate=60`), r());
};
import {Router as V} from 'express';
var W = e => {
    let o = V();
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
  N = W;
var Z = (e, o = {}) => {
    (e.disable('x-powered-by'),
      e.set('trust proxy', 1),
      e.use(J({logger: m, quietReqLogger: !0, autoLogging: !1, genReqId: !1})),
      e.use(Q()),
      e.use(K(o.helmet)),
      e.use(z(o.cors)),
      e.use(o.apiPrefix, B({keyGenerator: t => X(t.ip) || t.headers['x-huxy-auth'] || t.headers['x-api-key'] || t.headers.authorization, ...o.rateLimit})),
      e.use(S.json({limit: '20mb'})),
      e.use(S.urlencoded({extended: !0, limit: '20mb'})),
      e.use(o.apiPrefix, b(o)));
  },
  q = (e, o = {}) => {
    (e.use(N(o)), e.use(R(o)), e.use($(o)));
  },
  ee = async (e, o) => {
    let t = f(e),
      {port: r} = t;
    (await h(r, t.host)) || ((t.port = Number(r) + 1), m.warn(`\u7AEF\u53E3 ${r} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${t.port}`));
    let i = S();
    Z(i, t);
    let n = Y(i);
    y(n, t, m);
    try {
      await w(n, t);
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
  _ = ee;
var te = (e, o = 56) => {
    let t = e.length,
      r = o - t,
      s = ~~(r / 2);
    return `${'-'.repeat(s)}${e}${'-'.repeat(r - s)}`;
  },
  oe = (e, o, t) =>
    _({...g, ...e}, async (r, s, i, n) => {
      let {port: a, host: p, nodeEnv: x, basepath: l, appName: D = 'HuxyServer'} = r;
      if (!t) {
        let H = d()
          .filter(E => E !== `http://${p}`)
          .map(E => `http://${E}:${a}${l}`);
        (n.info(te(D)),
          n.info(`\u{1F680} \u670D\u52A1\u8FD0\u884C\u5728\u3010${x}\u3011\u73AF\u5883: http://${p}:${a}${l}`),
          n.info(`-----------------[${c()}]------------------`),
          n.info({ips: H}, '\u672C\u5730\u5730\u5740\uFF1A'));
      }
      await o?.(r, s, i, n);
    }),
  v = oe;
import ie from 'express';
import {fileURLToPath as re} from 'node:url';
import {dirname as se, resolve as ne} from 'node:path';
var P = (e = import.meta.url) => se(re(e)),
  I = (...e) => ne(P(), ...e),
  O = I;
var ae = {port: 9e3, host: 'localhost', basepath: '/', buildPath: './build'},
  ce = (e, o) =>
    v({...ae, ...e}, async (t, r, s, i) => {
      await o?.(t, r, s, i);
      let {basepath: n, buildPath: a} = t;
      (r.get('/', (x, l) => {
        l.redirect(n);
      }),
        r.use(n, ie.static(a, {})));
      let p = new RegExp(`^${n.replace(/\//g, '\\/')}(.*)$`);
      r.get(p, (x, l) => {
        l.sendFile(O(a, 'index.html'));
      });
    }),
  M = ce;
var qe = {startServer: v, startStatic: M, logger: m, createLogger: u, dateTime: c, localIPs: d, nodeArgs: T, getEnvConfig: f, checkPort: h, getDirName: P, resolvePath: I};
export {
  h as checkPort,
  u as createLogger,
  c as dateTime,
  qe as default,
  P as getDirName,
  f as getEnvConfig,
  d as localIPs,
  m as logger,
  T as nodeArgs,
  I as resolvePath,
  v as startServer,
  M as startStatic,
};
