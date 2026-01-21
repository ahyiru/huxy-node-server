import T from 'express';
import K from 'helmet';
import z from 'cors';
import {rateLimit as B, ipKeyGenerator as X} from 'express-rate-limit';
import Q from 'compression';
import {createServer as O} from 'node:http';
import J from 'node:https';
import H from 'node:os';
import k from 'node:net';
var l = (t = new Date()) => t.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  w = t => Object.prototype.toString.call(t).slice(8, -1).toLowerCase(),
  f = t => {
    let r = t ? 'https' : 'http',
      o = H.networkInterfaces(),
      e = [];
    return (Object.keys(o).map(n => e.push(...o[n])), e.filter(n => n.family === 'IPv4').map(n => n.address));
  },
  y = t => {
    let r = t ?? process.argv.slice(2) ?? [],
      o = {};
    return (
      r.map(e => {
        let [s, n] = e.split('=');
        o[s] = n;
      }),
      o
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
  j = (t, r, o) => {
    let [e, s] = t.split('.');
    e && s ? (o[e] || (o[e] = {}), (o[e][s] = r)) : (o[e] = r);
  },
  G = t => {
    let {connectSrc: r, ...o} = t;
    if (!r) return o;
    (o.helmet.contentSecurityPolicy || (o.helmet.contentSecurityPolicy = {}), o.helmet.contentSecurityPolicy.directives || (o.helmet.contentSecurityPolicy.directives = {}));
    let e = typeof r == 'string' ? r.split(',').map(s => s.trim()) : Array.isArray(r) ? r : [];
    return ((o.helmet.contentSecurityPolicy.directives.connectSrc = [...o.helmet.contentSecurityPolicy.directives.connectSrc, ...e]), o);
  },
  h = (t = {}, r = U) => {
    let {env: o} = process;
    Object.keys(r).map(s => {
      let n = o[s] ?? t[s];
      n && j(r[s], n, t);
    });
    let e = {...t, ...y()};
    return ((e.port = e.staticPort || e.port), (e.isDev = e.nodeEnv === 'development'), (e.protocol = 'http'), G(e));
  },
  g = (t, r = '127.0.0.1') =>
    new Promise(o => {
      let e = k.createServer();
      (e.once('error', s => {
        (e.close(), o((s.code === 'EADDRINUSE', !1)));
      }),
        e.once('listening', () => {
          (e.close(), o(!0));
        }),
        e.listen(Number(t), r));
    }),
  I = (t, r = {}, o) => {
    let e = s => {
      (o.warn(`\u6536\u5230 ${s} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        t.close(async () => {
          (o.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), await r.shutdown?.(), process.exit(0));
        }),
        setTimeout(() => {
          (o.error('\u274C \u5F3A\u5236\u5173\u95ED\u670D\u52A1\u5668'), process.exit(1));
        }, 5e3));
    };
    (process.on('SIGTERM', () => e('SIGTERM')),
      process.on('SIGINT', () => e('SIGINT')),
      process.on('uncaughtException', s => {
        (o.fatal(s, `\u{1F4A5} \u672A\u6355\u83B7\u7684\u5F02\u5E38: ${s.message}`), process.exit(1));
      }),
      process.on('unhandledRejection', (s, n) => {
        (o.fatal({reason: s, promise: n}, '\u26A0\uFE0F \u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'), process.exit(1));
      }));
  },
  L = (t, {port: r, host: o = '0.0.0.0'} = {}) =>
    new Promise((e, s) => {
      let n = c => {
          (a(), s(c));
        },
        i = () => {
          (a(), e(t));
        },
        a = () => {
          (t.off('error', n), t.off('listening', i));
        };
      (t.once('error', n), t.once('listening', i), t.listen(r, o));
    }),
  A = (t, r = 56) => {
    let o = t.length,
      e = r - o,
      s = ~~(e / 2);
    return `${'-'.repeat(s)}${t}${'-'.repeat(e - s)}`;
  };
var F =
  (t = {}) =>
  async (r = 'huxy') => {
    let {logLevel: o, transportOpt: e, ...s} = t,
      n = (await import('pino')).default,
      i = n({
        name: r,
        level: o ?? 'info',
        formatters: {level: a => ({level: a})},
        timestamp: n.stdTimeFunctions.isoTime,
        base: null,
        transport: {target: 'pino-pretty', options: {colorize: !0, levelFirst: !0, ...e}, ignore: 'pid,hostname,level,time', translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'},
        ...s,
      });
    return ((i.isPino = !0), i);
  };
var v = F;
var $ = (t, r) => (o, e, s) => {
    (r.error({message: 'Not Found', timestamp: l(), url: o.originalUrl, method: o.method, ip: o.ip, userAgent: o.get('User-Agent')}, '\u627E\u4E0D\u5230\u8DEF\u5F84'),
      e.status(404).json({success: !1, status: 404, url: o.originalUrl, message: `\u8DEF\u7531 [${o.method} ${o.originalUrl}] \u4E0D\u5B58\u5728`, timestamp: l()}));
  },
  R = (t, r) => (o, e, s, n) => {
    let i = o.status || 500,
      a = o.message;
    (r.error({message: a, timestamp: l(), stack: o.stack, url: e.originalUrl, method: e.method, ip: e.ip, userAgent: e.get('User-Agent')}, '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF'),
      s.status(i).json({success: !1, message: (t.isDev, a), stack: t.isDev ? o.stack : void 0, timestamp: l()}));
  };
import {Router as V} from 'express';
var W = t => {
    let r = V();
    return (
      r.use('/health', (o, e) => {
        e.status(200).json({status: 'OK', timestamp: l(), environment: t.nodeEnv, uptime: process.uptime(), memoryUsage: process.memoryUsage(), pid: process.pid});
      }),
      r.get('/', (o, e) => {
        e.status(200).json({message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D', timestamp: l(), environment: t.nodeEnv});
      }),
      r
    );
  },
  b = W;
var Y = async (t, r = {}, o) => {
    if ((t.disable('x-powered-by'), t.set('trust proxy', r.trustProxy ?? 1), o.isPino)) {
      let e = (await import('pino-http')).default;
      t.use(e({logger: o, quietReqLogger: !0, autoLogging: !1, genReqId: !1}));
    } else
      t.use((e, s, n) => {
        e.log = o;
      });
    (t.use(Q()),
      t.use(K(r.helmet)),
      t.use(z(r.cors)),
      t.use(r.apiPrefix, B({keyGenerator: e => X(e.ip) || e.headers['x-huxy-auth'] || e.headers['x-api-key'] || e.headers.authorization, ...r.rateLimit})),
      t.use(T.json({limit: '20mb'})),
      t.use(T.urlencoded({extended: !0, limit: '20mb'})));
  },
  Z = (t, r = {}, o) => {
    (t.use(b(r)), t.use($(r, o)), t.use(R(r, o)));
  },
  q = async (t = {}, r) => {
    let {logger: o, ...e} = h(t),
      s = o ?? (await v(e.loggerConfig)('huxy')),
      {port: n, ssl: i} = e;
    (await g(n, e.host)) || ((e.port = Number(n) + 1), s.warn(`\u7AEF\u53E3 ${n} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${e.port}`));
    let c = T();
    await Y(c, e, s);
    let p;
    (i
      ? (w(i) === 'object' ||
          (s.error({ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}}, '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}'), process.exit(1)),
        (e.protocol = 'https'),
        (p = J.createServer(i, c)),
        O((u, d) => {
          (d.writeHead(301, {Location: `${e.protocol}://${u.headers.host}${u.url}`}), d.end());
        }).listen(80))
      : (p = O(c)),
      I(p, e, s));
    try {
      await L(p, e);
    } catch (m) {
      (s.error({err: m}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25'), process.exit(1));
    }
    try {
      await r?.(e, c, p, s);
    } catch (m) {
      (s.error({err: m}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${m.message}`), process.exit(1));
    }
    return (Z(c, e, s), {app: c, httpServer: p, config: e, logger: s});
  },
  _ = q;
import 'dotenv';
var ee = {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    basepath: process.env.BASEPATH || '/',
    apiPrefix: '/',
    cors: {origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: !0},
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000', 10),
      limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '500', 10),
      message: {message: '\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5'},
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {defaultSrc: ["'self'"], connectSrc: ['*'], styleSrc: ["'self'", "'unsafe-inline'"], scriptSrc: ["'self'", "'unsafe-eval'"], imgSrc: ["'self'", 'data:', 'https:']},
      },
      crossOriginEmbedderPolicy: !1,
    },
    logLevel: process.env.LOG_LEVEL || 30,
  },
  N = ee;
var te = (t, r, o) =>
    _({...N, ...t}, async (e, s, n, i) => {
      let {port: a, host: c, nodeEnv: p, basepath: m, appName: u = 'HuxyServer', protocol: d} = e;
      if (!o) {
        let D = f()
          .filter(S => S !== c)
          .map(S => `${d}://${S}:${a}${m}`);
        (i.info(A(u)),
          i.info(`\u{1F680} \u670D\u52A1\u8FD0\u884C\u5728\u3010${p}\u3011\u73AF\u5883: ${d}://${c}:${a}${m}`),
          i.info(`-----------------[${l()}]------------------`),
          i.info({ips: D}, '\u672C\u5730\u5730\u5740'));
      }
      await r?.(e, s, n, i);
    }),
  x = te;
import ne from 'express';
import {fileURLToPath as oe} from 'node:url';
import {dirname as re, resolve as se} from 'node:path';
var E = (t = import.meta.url) => re(oe(t)),
  P = (...t) => se(E(), ...t),
  C = P;
var ie = {port: 9e3, host: 'localhost', basepath: '/', buildPath: './build'},
  ae = t => (t ? (t.endsWith('/') ? t : `${t}/`) : '/'),
  ce = (t, r) =>
    x({...ie, ...t}, async (o, e, s, n) => {
      await r?.(o, e, s, n);
      let {basepath: i, buildPath: a} = o;
      (i !== '/' &&
        e.get('/', (m, u, d) => {
          if (m.path === '/') return u.redirect(i);
          d();
        }),
        e.use(i, ne.static(a, {...o.staticCache})));
      let c = ae(i),
        p = new RegExp(`^${c.replace(/\//g, '\\/')}(.*)$`);
      e.get(p, (m, u) => {
        u.sendFile(C(a, 'index.html'));
      });
    }),
  M = ce;
var Je = {startServer: x, startStatic: M, createLogger: v, dateTime: l, localIPs: f, nodeArgs: y, getEnvConfig: h, checkPort: g, getDirName: E, resolvePath: P};
export {g as checkPort, v as createLogger, l as dateTime, Je as default, E as getDirName, h as getEnvConfig, f as localIPs, y as nodeArgs, P as resolvePath, x as startServer, M as startStatic};
