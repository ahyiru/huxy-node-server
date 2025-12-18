import E from 'express';
import V from 'helmet';
import W from 'cors';
import {rateLimit as K, ipKeyGenerator as z} from 'express-rate-limit';
import X from 'compression';
import B from 'pino-http';
import {createServer as Q} from 'node:http';
import A from 'pino';
import M from 'node:os';
import C from 'node:net';
var m = (e = new Date()) => e.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  u = e => {
    let r = e ? 'https' : 'http',
      t = M.networkInterfaces(),
      o = [];
    return (Object.keys(t).map(n => o.push(...t[n])), o.filter(n => n.family === 'IPv4').map(n => `${r}://${n.address}`));
  },
  x = e => {
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
  k = {
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
  U = (e, r, t) => {
    let [o, s] = e.split('.');
    o && s ? (t[o] || (t[o] = {}), (t[o][s] = r)) : (t[o] = r);
  },
  d = (e = {}, r = k) => {
    let {env: t} = process;
    Object.keys(r).map(s => {
      let i = t[s] ?? e[s];
      i && U(r[s], i, e);
    });
    let o = {...e, ...x()};
    return ((o.port = o.staticPort || o.port), (o.isDev = o.NODE_ENV === 'development'), o);
  },
  f = (e, r = '127.0.0.1') =>
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
  I = (e, r = {}) => {
    let t = o => {
      (a.warn(`\u6536\u5230 ${o} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        e.close(async () => {
          (a.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), await r.shutdown?.(), process.exit(0));
        }),
        setTimeout(() => {
          (a.error('\u274C \u5F3A\u5236\u5173\u95ED\u670D\u52A1\u5668'), process.exit(1));
        }, 5e3));
    };
    (process.on('SIGTERM', () => t('SIGTERM')),
      process.on('SIGINT', () => t('SIGINT')),
      process.on('uncaughtException', o => {
        (a.fatal(o, `\u{1F4A5} \u672A\u6355\u83B7\u7684\u5F02\u5E38: ${o.message}`), process.exit(1));
      }),
      process.on('unhandledRejection', (o, s) => {
        (a.fatal({reason: o, promise: s}, '\u26A0\uFE0F \u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'), process.exit(1));
      }));
  },
  y = (e, {port: r, host: t = '0.0.0.0'} = {}) =>
    new Promise((o, s) => {
      let i = l => {
          (c(), s(l));
        },
        n = () => {
          (c(), o(e));
        },
        c = () => {
          (e.off('error', i), e.off('listening', n));
        };
      (e.once('error', i), e.once('listening', n), e.listen(r, t));
    });
import 'dotenv';
var G = {
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
  g = G;
var p = (e, r) =>
  A({
    name: e,
    level: g.logLevel,
    formatters: {level: t => ({level: t})},
    timestamp: A.stdTimeFunctions.isoTime,
    base: null,
    transport: {target: 'pino-pretty', options: {colorize: !0, sync: !0, levelFirst: !0}, ignore: 'pid,hostname,level,time', translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'},
    ...r,
  });
var a = p('huxy');
var w = p('error-handler'),
  L = e => (r, t, o) => {
    (w.error({message: 'Not Found', timestamp: m(), url: r.originalUrl, method: r.method, ip: r.ip, userAgent: r.get('User-Agent')}, '\u627E\u4E0D\u5230\u8DEF\u5F84'),
      t.status(404).json({success: !1, timestamp: m(), status: 404, message: `\u8DEF\u7531 ${r.method} ${r.originalUrl} \u4E0D\u5B58\u5728`, url: r.originalUrl}));
  },
  b = e => (r, t, o, s) => {
    let i = r.status || 500,
      n = r.message;
    (w.error({message: n, timestamp: m(), stack: r.stack, url: t.originalUrl, method: t.method, ip: t.ip, userAgent: t.get('User-Agent')}, '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF'),
      o.status(i).json({success: !1, timestamp: m(), message: e.isDev ? n : '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF', stack: e.isDev ? r.stack : void 0}));
  };
var R = e => (r, t, o) => {
  (t.set('Cache-Control', `public, max-age=${e.cacheMaxAge ?? 300}, stale-while-revalidate=60`), o());
};
import {Router as j} from 'express';
var F = e => {
    let r = j();
    return (
      r.use('/health', (t, o) => {
        o.status(200).json({status: 'OK', timestamp: m(), environment: e.nodeEnv, uptime: process.uptime(), memoryUsage: process.memoryUsage(), pid: process.pid});
      }),
      r.get('/status', (t, o) => {
        o.status(200).json({message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D', timestamp: m(), environment: e.nodeEnv});
      }),
      r
    );
  },
  N = F;
var J = (e, r = {}) => {
    (e.disable('x-powered-by'),
      e.set('trust proxy', 1),
      e.use(B({logger: a, quietReqLogger: !0, autoLogging: !1, genReqId: !1})),
      e.use(X()),
      e.use(V(r.helmet)),
      e.use(W(r.cors)),
      e.use(r.apiPrefix, K({keyGenerator: t => z(t.ip) || t.headers['x-huxy-auth'] || t.headers['x-api-key'] || t.headers.authorization, ...r.rateLimit})),
      e.use(E.json({limit: '20mb'})),
      e.use(E.urlencoded({extended: !0, limit: '20mb'})),
      e.use(r.apiPrefix, R(r)));
  },
  Y = (e, r = {}) => {
    (e.use(N(r)), e.use(L(r)), e.use(b(r)));
  },
  Z = async (e, r) => {
    let t = d(e),
      {port: o} = t;
    (await f(o, t.host)) || ((t.port = Number(o) + 1), a.warn(`\u7AEF\u53E3 ${o} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${t.port}`));
    let i = E();
    J(i, t);
    let n = Q(i);
    I(n, t);
    try {
      await y(n, t);
    } catch {
      (a.error('\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25'), process.exit(1));
    }
    return (await r?.(t, i, n), Y(i, t), {app: i, httpServer: n, config: t});
  },
  _ = Z;
var q = (e, r = 56) => {
    let t = e.length,
      o = r - t,
      s = ~~(o / 2);
    return `${'-'.repeat(s)}${e}${'-'.repeat(o - s)}`;
  },
  ee = (e, r, t) =>
    _({...g, ...e}, async (o, s, i) => {
      let {port: n, host: c, nodeEnv: l, basepath: P, appName: D = 'HuxyServer'} = o;
      if (!t) {
        let H = u()
          .filter(v => v !== `http://${c}`)
          .map(v => `http://${v}:${n}${P}`);
        (a.info(q(D)),
          a.info(`\u{1F680} \u670D\u52A1\u8FD0\u884C\u5728\u3010${l}\u3011\u73AF\u5883: http://${c}:${n}${P}`),
          a.info(`-----------------[${m()}]------------------`),
          a.info({ips: H}, '\u672C\u5730\u5730\u5740\uFF1A'));
      }
      await r?.(o, s, i);
    }),
  h = ee;
import se from 'express';
import {fileURLToPath as te} from 'node:url';
import {dirname as oe, resolve as re} from 'node:path';
var T = (e = import.meta.url) => oe(te(e)),
  S = e => re(T(), e),
  $ = S;
var ne = {port: 9e3, host: 'localhost', basepath: '/', buildPath: './build'},
  ie = (e, r) =>
    h({...ne, ...e}, async (t, o, s) => {
      let {basepath: i, buildPath: n} = t;
      (o.use(
        i,
        se.static(n, {
          maxAge: '1y',
          immutable: !0,
          setHeaders: (c, l) => {
            l.endsWith('.html') && c.setHeader('Cache-Control', 'no-cache, must-revalidate');
          },
        }),
      ),
        o.get(`${i}/{*splat}`.replace('//', '/'), (c, l) => {
          l.sendFile($(n, 'index.html'));
        }),
        await r?.(t, o, s));
    }),
  O = ie;
var tt = {startServer: h, startStatic: O, logger: a, createLogger: p, dateTime: m, localIPs: u, nodeArgs: x, getEnvConfig: d, checkPort: f, getDirName: T, resolvePath: S};
export {
  f as checkPort,
  p as createLogger,
  m as dateTime,
  tt as default,
  T as getDirName,
  d as getEnvConfig,
  u as localIPs,
  a as logger,
  x as nodeArgs,
  S as resolvePath,
  h as startServer,
  O as startStatic,
};
