import T from 'express';
import V from 'helmet';
import F from 'cors';
import {rateLimit as K, ipKeyGenerator as W} from 'express-rate-limit';
import z from 'compression';
import X from 'pino-http';
import {createServer as B} from 'node:http';
import U from 'pino';
import w from 'node:os';
import D from 'node:net';
var m = (t = new Date()) => t.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  l = t => {
    let o = t ? 'https' : 'http',
      e = w.networkInterfaces(),
      r = [];
    return (Object.keys(e).map(i => r.push(...e[i])), r.filter(i => i.family === 'IPv4').map(i => `${o}://${i.address}`));
  },
  x = t => {
    let o = t ?? process.argv.slice(2) ?? [],
      e = {};
    return (
      o.map(r => {
        let [n, s] = r.split('=');
        e[n] = s;
      }),
      e
    );
  },
  H = {
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
  M = (t, o, e) => {
    let [r, n] = t.split('.');
    r && n ? (e[r] || (e[r] = {}), (e[r][n] = o)) : (e[r] = o);
  },
  u = (t = {}, o = H) => {
    let {env: e} = process;
    Object.keys(o).map(n => {
      let s = e[n];
      s && M(o[n], s, t);
    });
    let r = {...t, ...x()};
    return ((r.port = r.staticPort || r.port), (r.isDev = r.NODE_ENV === 'development'), r);
  },
  d = (t, o = '127.0.0.1') =>
    new Promise(e => {
      let r = D.createServer();
      (r.once('error', n => {
        (r.close(), e((n.code === 'EADDRINUSE', !1)));
      }),
        r.once('listening', () => {
          (r.close(), e(!0));
        }),
        r.listen(Number(t), o));
    });
import 'dotenv';
var k = {
    nodeEnv: 'production',
    isDev: !1,
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
      contentSecurityPolicy: {directives: {defaultSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], scriptSrc: ["'self'"], imgSrc: ["'self'", 'data:', 'https:']}},
      crossOriginEmbedderPolicy: !1,
    },
    logLevel: process.env.LOG_LEVEL || 30,
  },
  f = k;
var c = (t, o) =>
    U({
      name: t,
      level: f.logLevel,
      transport: {target: 'pino-pretty', options: {colorize: !0, sync: !0}, ignore: 'pid,hostname,level,time', translateTime: 'UTC:yyyy-mm-dd HH:MM:ss', customColors: 'err:red,info:blue'},
      ...o,
    }),
  P = () => {
    let t = c('http-request');
    return (o, e, r) => {
      let n = Date.now();
      (e.on('finish', () => {
        let s = Date.now() - n,
          i = {method: o.method, url: o.originalUrl, status: e.statusCode, duration: `${s}ms`, ip: o.ip, userAgent: o.get('User-Agent'), timestamp: m()};
        e.statusCode >= 500 ? t.error(i, 'HTTP\u8BF7\u6C42\u9519\u8BEF') : e.statusCode >= 400 ? t.warn(i, 'HTTP\u5BA2\u6237\u7AEF\u9519\u8BEF') : t.info(i, 'HTTP\u8BF7\u6C42');
      }),
        r());
    };
  },
  a = c('huxy');
var y = c('error-handler'),
  b = t => (o, e, r) => {
    (y.error({message: 'Not Found', timestamp: m(), url: o.originalUrl, method: o.method, ip: o.ip, userAgent: o.get('User-Agent')}, '\u627E\u4E0D\u5230\u8DEF\u5F84'),
      e.status(404).json({success: !1, timestamp: m(), status: 404, message: `\u8DEF\u7531 ${o.method} ${o.originalUrl} \u4E0D\u5B58\u5728`, url: o.originalUrl}));
  },
  A = t => (o, e, r, n) => {
    let s = o.status || 500,
      i = o.message;
    (y.error({message: i, timestamp: m(), stack: o.stack, url: e.originalUrl, method: e.method, ip: e.ip, userAgent: e.get('User-Agent')}, '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF'),
      r.status(s).json({success: !1, timestamp: m(), message: t.isDev ? i : '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF', stack: t.isDev ? o.stack : void 0}));
  };
var L = t => (o, e, r) => {
  (o.path.match(/\.(js|css|png|jpe?g|ico|webp|svg|mpeg|webm|m4a)$/) ? e.set('Cache-Control', 'public, max-age=31536000, immutable') : e.set('Cache-Control', 'no-cache'), r());
};
import {Router as j} from 'express';
var G = t => {
    let o = j();
    return (
      o.use('/health', (e, r) => {
        r.status(200).json({status: 'OK', timestamp: m(), uptime: process.uptime(), environment: t.nodeEnv, memoryUsage: process.memoryUsage(), pid: process.pid});
      }),
      o.get('/', (e, r) => {
        r.status(200).json({message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D', timestamp: m(), environment: t.nodeEnv});
      }),
      o
    );
  },
  N = G;
var Q = (t, o = {}) => (
    t.disable('x-powered-by'),
    t.set('trust proxy', 1),
    t.use(V(o.helmet)),
    t.use(F(o.cors)),
    t.use(K({keyGenerator: e => W(e.ip) || e.headers['x-huxy-auth'] || e.headers['x-api-key'] || e.headers.authorization, ...o.rateLimit})),
    t.use(z()),
    t.use(T.json({limit: '20mb'})),
    t.use(T.urlencoded({extended: !0, limit: '20mb'})),
    t.use(X({logger: a, quietReqLogger: !0, autoLogging: !1})),
    t.use(P()),
    t.use(L(o)),
    t
  ),
  J = t => {
    let o = e => {
      (a.info(`\u6536\u5230 ${e} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        t.close(() => {
          (a.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), process.exit(0));
        }),
        setTimeout(() => {
          (a.error('\u274C \u5F3A\u5236\u5173\u95ED\u670D\u52A1\u5668'), process.exit(1));
        }, 5e3));
    };
    (process.on('SIGTERM', () => o('SIGTERM')),
      process.on('SIGINT', () => o('SIGINT')),
      process.on('uncaughtException', e => {
        (a.error(e, `\u672A\u6355\u83B7\u7684\u5F02\u5E38: ${e.message}`), process.exit(1));
      }),
      process.on('unhandledRejection', (e, r) => {
        (a.error({reason: e, promise: r}, '\u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'), process.exit(1));
      }));
  },
  Z = async (t, o) => {
    let e = u(t),
      {port: r} = e;
    (await d(r, e.host)) || ((e.port = Number(r) + 1), a.warn(`\u7AEF\u53E3 ${r} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${e.port}`));
    let s = T();
    Q(s, e);
    let i = B(s);
    return (o?.(i, s, e), s.use(N(e)), s.use(b(e)), s.use(A(e)), J(i), {app: s, httpServer: i, config: e});
  },
  R = Z;
var Y = (t, o, e) =>
    R({...f, ...t}, (r, n, s) => {
      let {port: i, host: p, nodeEnv: h, basepath: I, appName: C = 'HuxyServer'} = s;
      r.listen(i, p, () => {
        if (!e) {
          let $ = l()
            .filter(v => v !== `http://${p}`)
            .map(v => `http://${v}:${i}${I}`);
          (a.info(`-----------------------${C}-----------------------`),
            a.info(`\u{1F680} \u670D\u52A1\u8FD0\u884C\u5728\u3010${h}\u3011\u73AF\u5883: http://${p}:${i}${I}`),
            a.info(`-----------------[${m()}]------------------`),
            a.info({ips: $}, '\u672C\u5730\u5730\u5740\uFF1A'));
        }
        o?.(s, n, r);
      });
    }),
  g = Y;
import oe from 'express';
import {fileURLToPath as q} from 'node:url';
import {dirname as ee, resolve as te} from 'node:path';
var E = (t = import.meta.url) => ee(q(t)),
  S = t => te(E(), t),
  _ = S;
var re = {port: 9e3, host: 'localhost', basepath: '/', buildPath: './build'},
  se = (t, o) =>
    g({...re, ...t}, (e, r, n) => {
      let {basepath: s, buildPath: i} = e;
      (r.use(s, oe.static(i, {maxAge: '1y', immutable: !0})),
        r.get(`${s}/{*splat}`.replace('//', '/'), (p, h) => {
          h.sendFile(_(i, 'index.html'));
        }),
        o?.(e, r, n));
    }),
  O = se;
var Ye = {startServer: g, startStatic: O, logger: a, createLogger: c, dateTime: m, localIPs: l, nodeArgs: x, getEnvConfig: u, checkPort: d, getDirName: E, resolvePath: S};
export {
  d as checkPort,
  c as createLogger,
  m as dateTime,
  Ye as default,
  E as getDirName,
  u as getEnvConfig,
  l as localIPs,
  a as logger,
  x as nodeArgs,
  S as resolvePath,
  g as startServer,
  O as startStatic,
};
