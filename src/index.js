import E from 'express';
import K from 'helmet';
import W from 'cors';
import {rateLimit as z, ipKeyGenerator as X} from 'express-rate-limit';
import B from 'compression';
import Q from 'pino-http';
import {createServer as J} from 'node:http';
import w from 'pino';
import M from 'node:os';
import k from 'node:net';
var m = (e = new Date()) => e.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  u = e => {
    let o = e ? 'https' : 'http',
      t = M.networkInterfaces(),
      r = [];
    return (Object.keys(t).map(n => r.push(...t[n])), r.filter(n => n.family === 'IPv4').map(n => `${o}://${n.address}`));
  },
  x = e => {
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
  j = (e, o, t) => {
    let [r, s] = e.split('.');
    r && s ? (t[r] || (t[r] = {}), (t[r][s] = o)) : (t[r] = o);
  },
  d = (e = {}, o = U) => {
    let {env: t} = process;
    Object.keys(o).map(s => {
      let i = t[s] ?? e[s];
      i && j(o[s], i, e);
    });
    let r = {...e, ...x()};
    return ((r.port = r.staticPort || r.port), (r.isDev = r.NODE_ENV === 'development'), r);
  },
  f = (e, o = '127.0.0.1') =>
    new Promise(t => {
      let r = k.createServer();
      (r.once('error', s => {
        (r.close(), t((s.code === 'EADDRINUSE', !1)));
      }),
        r.once('listening', () => {
          (r.close(), t(!0));
        }),
        r.listen(Number(e), o));
    }),
  I = (e, o = {}) => {
    let t = r => {
      (a.warn(`\u6536\u5230 ${r} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        e.close(async () => {
          (a.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), await o.shutdown?.(), process.exit(0));
        }),
        setTimeout(() => {
          (a.error('\u274C \u5F3A\u5236\u5173\u95ED\u670D\u52A1\u5668'), process.exit(1));
        }, 5e3));
    };
    (process.on('SIGTERM', () => t('SIGTERM')),
      process.on('SIGINT', () => t('SIGINT')),
      process.on('uncaughtException', r => {
        (a.fatal(r, `\u{1F4A5} \u672A\u6355\u83B7\u7684\u5F02\u5E38: ${r.message}`), process.exit(1));
      }),
      process.on('unhandledRejection', (r, s) => {
        (a.fatal({reason: r, promise: s}, '\u26A0\uFE0F \u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'), process.exit(1));
      }));
  },
  P = (e, {port: o, host: t = '0.0.0.0'} = {}) =>
    new Promise((r, s) => {
      let i = l => {
          (c(), s(l));
        },
        n = () => {
          (c(), r(e));
        },
        c = () => {
          (e.off('error', i), e.off('listening', n));
        };
      (e.once('error', i), e.once('listening', n), e.listen(o, t));
    });
import 'dotenv';
var G = {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    basepath: process.env.BASEPATH || '/',
    cors: {origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: !0},
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      message: {error: '\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5'},
    },
    helmet: {
      contentSecurityPolicy: {directives: {defaultSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], scriptSrc: ["'self'", "'unsafe-eval'"], imgSrc: ["'self'", 'data:', 'https:']}},
      crossOriginEmbedderPolicy: !1,
    },
    logLevel: process.env.LOG_LEVEL || 30,
  },
  g = G;
var p = (e, o) =>
    w({
      name: e,
      level: g.logLevel,
      formatters: {level: t => ({level: t})},
      timestamp: w.stdTimeFunctions.isoTime,
      base: null,
      transport: {target: 'pino-pretty', options: {colorize: !0, sync: !0, levelFirst: !0}, ignore: 'pid,hostname,level,time', translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'},
      ...o,
    }),
  L = () => {
    let e = p('http-request');
    return (o, t, r) => {
      let s = Date.now();
      (t.on('finish', () => {
        let i = Date.now() - s,
          n = {method: o.method, url: o.originalUrl, status: t.statusCode, duration: `${i}ms`, ip: o.ip, userAgent: o.get('User-Agent'), timestamp: m()};
        t.statusCode >= 500 ? e.error(n, 'HTTP\u8BF7\u6C42\u9519\u8BEF') : t.statusCode >= 400 && e.warn(n, 'HTTP\u5BA2\u6237\u7AEF\u9519\u8BEF');
      }),
        r());
    };
  },
  a = p('huxy');
var b = p('error-handler'),
  A = e => (o, t, r) => {
    (b.error({message: 'Not Found', timestamp: m(), url: o.originalUrl, method: o.method, ip: o.ip, userAgent: o.get('User-Agent')}, '\u627E\u4E0D\u5230\u8DEF\u5F84'),
      t.status(404).json({success: !1, timestamp: m(), status: 404, message: `\u8DEF\u7531 ${o.method} ${o.originalUrl} \u4E0D\u5B58\u5728`, url: o.originalUrl}));
  },
  N = e => (o, t, r, s) => {
    let i = o.status || 500,
      n = o.message;
    (b.error({message: n, timestamp: m(), stack: o.stack, url: t.originalUrl, method: t.method, ip: t.ip, userAgent: t.get('User-Agent')}, '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF'),
      r.status(i).json({success: !1, timestamp: m(), message: e.isDev ? n : '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF', stack: e.isDev ? o.stack : void 0}));
  };
var R = e => (o, t, r) => {
  (o.path.match(/\.(js|css|png|jpe?g|ico|webp|svg|mpeg|webm|m4a)$/) ? t.set('Cache-Control', 'public, max-age=31536000, immutable') : t.set('Cache-Control', 'no-cache'), r());
};
import {Router as F} from 'express';
var V = e => {
    let o = F();
    return (
      o.use('/health', (t, r) => {
        r.status(200).json({status: 'OK', timestamp: m(), environment: e.nodeEnv, uptime: process.uptime(), memoryUsage: process.memoryUsage(), pid: process.pid});
      }),
      o.get('/status', (t, r) => {
        r.status(200).json({message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D', timestamp: m(), environment: e.nodeEnv});
      }),
      o
    );
  },
  _ = V;
var Y = (e, o = {}) => {
    (e.disable('x-powered-by'),
      e.set('trust proxy', 1),
      e.use(K(o.helmet)),
      e.use(W(o.cors)),
      e.use(z({keyGenerator: t => X(t.ip) || t.headers['x-huxy-auth'] || t.headers['x-api-key'] || t.headers.authorization, ...o.rateLimit})),
      e.use(B()),
      e.use(E.json({limit: '20mb'})),
      e.use(E.urlencoded({extended: !0, limit: '20mb'})),
      e.use(Q({logger: a, quietReqLogger: !0, autoLogging: !1})),
      o.isDev && e.use(L()),
      e.use(R(o)));
  },
  Z = (e, o = {}) => {
    (e.use(_(o)), e.use(A(o)), e.use(N(o)));
  },
  q = async (e, o) => {
    let t = d(e),
      {port: r} = t;
    (await f(r, t.host)) || ((t.port = Number(r) + 1), a.warn(`\u7AEF\u53E3 ${r} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${t.port}`));
    let i = E();
    Y(i, t);
    let n = J(i);
    I(n, t);
    try {
      await P(n, t);
    } catch {
      (a.error('\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25'), process.exit(1));
    }
    return (await o?.(t, i, n), Z(i, t), {app: i, httpServer: n, config: t});
  },
  $ = q;
var ee = (e, o = 56) => {
    let t = e.length,
      r = o - t,
      s = ~~(r / 2);
    return `${'-'.repeat(s)}${e}${'-'.repeat(r - s)}`;
  },
  te = (e, o, t) =>
    $({...g, ...e}, async (r, s, i) => {
      let {port: n, host: c, nodeEnv: l, basepath: y, appName: C = 'HuxyServer'} = r;
      if (!t) {
        let H = u()
          .filter(v => v !== `http://${c}`)
          .map(v => `http://${v}:${n}${y}`);
        (a.info(ee(C)),
          a.info(`\u{1F680} \u670D\u52A1\u8FD0\u884C\u5728\u3010${l}\u3011\u73AF\u5883: http://${c}:${n}${y}`),
          a.info(`-----------------[${m()}]------------------`),
          a.info({ips: H}, '\u672C\u5730\u5730\u5740\uFF1A'));
      }
      await o?.(r, s, i);
    }),
  h = te;
import ne from 'express';
import {fileURLToPath as oe} from 'node:url';
import {dirname as re, resolve as se} from 'node:path';
var T = (e = import.meta.url) => re(oe(e)),
  S = e => se(T(), e),
  O = S;
var ie = {port: 9e3, host: 'localhost', basepath: '/', buildPath: './build'},
  ae = (e, o) =>
    h({...ie, ...e}, async (t, r, s) => {
      let {basepath: i, buildPath: n} = t;
      (r.use(i, ne.static(n, {maxAge: '1y', immutable: !0})),
        r.get(`${i}/{*splat}`.replace('//', '/'), (c, l) => {
          l.sendFile(O(n, 'index.html'));
        }),
        await o?.(t, r, s));
    }),
  D = ae;
var ot = {startServer: h, startStatic: D, logger: a, createLogger: p, dateTime: m, localIPs: u, nodeArgs: x, getEnvConfig: d, checkPort: f, getDirName: T, resolvePath: S};
export {
  f as checkPort,
  p as createLogger,
  m as dateTime,
  ot as default,
  T as getDirName,
  d as getEnvConfig,
  u as localIPs,
  a as logger,
  x as nodeArgs,
  S as resolvePath,
  h as startServer,
  D as startStatic,
};
