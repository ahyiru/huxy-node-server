import y from 'express';
import K from 'helmet';
import z from 'cors';
import {rateLimit as B, ipKeyGenerator as X} from 'express-rate-limit';
import Q from 'compression';
import {createServer as N} from 'node:http';
import J from 'node:https';
import U from 'node:os';
import j from 'node:net';
var c = (t = new Date()) => t.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  L = t => Object.prototype.toString.call(t).slice(8, -1).toLowerCase(),
  f = t => {
    let o = t ? 'https' : 'http',
      s = U.networkInterfaces(),
      e = [];
    return (Object.keys(s).map(n => e.push(...s[n])), e.filter(n => n.family === 'IPv4').map(n => n.address));
  },
  T = t => {
    let o = t ?? process.argv.slice(2) ?? [],
      s = {};
    return (
      o.map(e => {
        let [r, n] = e.split('=');
        s[r] = n;
      }),
      s
    );
  },
  G = {
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
  F = (t, o, s) => {
    let [e, r] = t.split('.');
    e && r ? (s[e] || (s[e] = {}), (s[e][r] = o)) : (s[e] = o);
  },
  g = (t = {}, o = G) => {
    let {env: s} = process;
    Object.keys(o).map(r => {
      let n = s[r] ?? t[r];
      n && F(o[r], n, t);
    });
    let e = {...t, ...T()};
    return ((e.port = e.staticPort || e.port), (e.isDev = e.nodeEnv === 'development'), (e.protocol = 'http'), e);
  },
  h = (t, o = '127.0.0.1') =>
    new Promise(s => {
      let e = j.createServer();
      (e.once('error', r => {
        (e.close(), s((r.code === 'EADDRINUSE', !1)));
      }),
        e.once('listening', () => {
          (e.close(), s(!0));
        }),
        e.listen(Number(t), o));
    }),
  I = (t, o = {}, s) => {
    let e = r => {
      (s.warn(`\u6536\u5230 ${r} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        t.close(async () => {
          (s.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), await o.shutdown?.(), process.exit(0));
        }),
        setTimeout(() => {
          (s.error('\u274C \u5F3A\u5236\u5173\u95ED\u670D\u52A1\u5668'), process.exit(1));
        }, 5e3));
    };
    (process.on('SIGTERM', () => e('SIGTERM')),
      process.on('SIGINT', () => e('SIGINT')),
      process.on('uncaughtException', r => {
        (s.fatal(r, `\u{1F4A5} \u672A\u6355\u83B7\u7684\u5F02\u5E38: ${r.message}`), process.exit(1));
      }),
      process.on('unhandledRejection', (r, n) => {
        (s.fatal({reason: r, promise: n}, '\u26A0\uFE0F \u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'), process.exit(1));
      }));
  },
  A = (t, {port: o, host: s = '0.0.0.0'} = {}) =>
    new Promise((e, r) => {
      let n = a => {
          (p(), r(a));
        },
        i = () => {
          (p(), e(t));
        },
        p = () => {
          (t.off('error', n), t.off('listening', i));
        };
      (t.once('error', n), t.once('listening', i), t.listen(o, s));
    }),
  $ = (t, o = 56) => {
    let s = t.length,
      e = o - s,
      r = ~~(e / 2);
    return `${'-'.repeat(r)}${t}${'-'.repeat(e - r)}`;
  };
var E =
  (t = {}) =>
  async (o = 'huxy') => {
    let {logLevel: s, transportOpt: e, ...r} = t,
      n = (await import('pino')).default,
      i = n({
        name: o,
        level: s ?? 'info',
        formatters: {level: p => ({level: p})},
        timestamp: n.stdTimeFunctions.isoTime,
        base: null,
        transport: {target: 'pino-pretty', options: {colorize: !0, levelFirst: !0, ...e}, ignore: 'pid,hostname,level,time', translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'},
        ...r,
      });
    return ((i.isPino = !0), i);
  };
var x = E;
var R = E('error-handler'),
  b = t => (o, s, e) => {
    (R.error({message: 'Not Found', timestamp: c(), url: o.originalUrl, method: o.method, ip: o.ip, userAgent: o.get('User-Agent')}, '\u627E\u4E0D\u5230\u8DEF\u5F84'),
      s.status(404).json({success: !1, status: 404, url: o.originalUrl, message: `\u8DEF\u7531 [${o.method} ${o.originalUrl}] \u4E0D\u5B58\u5728`, timestamp: c()}));
  },
  O = t => (o, s, e, r) => {
    let n = o.status || 500,
      i = o.message;
    (R.error({message: i, timestamp: c(), stack: o.stack, url: s.originalUrl, method: s.method, ip: s.ip, userAgent: s.get('User-Agent')}, '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF'),
      e.status(n).json({success: !1, message: (t.isDev, i), stack: t.isDev ? o.stack : void 0, timestamp: c()}));
  };
import {Router as V} from 'express';
var W = t => {
    let o = V();
    return (
      o.use('/health', (s, e) => {
        e.status(200).json({status: 'OK', timestamp: c(), environment: t.nodeEnv, uptime: process.uptime(), memoryUsage: process.memoryUsage(), pid: process.pid});
      }),
      o.get('/', (s, e) => {
        e.status(200).json({message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D', timestamp: c(), environment: t.nodeEnv});
      }),
      o
    );
  },
  _ = W;
var Y = async (t, o = {}, s) => {
    if ((t.disable('x-powered-by'), t.set('trust proxy', o.trustProxy ?? 1), s.isPino)) {
      let e = (await import('pino-http')).default;
      t.use(e({logger: s, quietReqLogger: !0, autoLogging: !1, genReqId: !1}));
    } else
      t.use((e, r, n) => {
        e.log = s;
      });
    (t.use(Q()),
      t.use(K(o.helmet)),
      t.use(z(o.cors)),
      t.use(o.apiPrefix, B({keyGenerator: e => X(e.ip) || e.headers['x-huxy-auth'] || e.headers['x-api-key'] || e.headers.authorization, ...o.rateLimit})),
      t.use(y.json({limit: '20mb'})),
      t.use(y.urlencoded({extended: !0, limit: '20mb'})));
  },
  Z = (t, o = {}) => {
    (t.use(_(o)), t.use(b(o)), t.use(O(o)));
  },
  q = async (t = {}, o) => {
    let {logger: s, ...e} = g(t),
      r = s ?? (await x(e.loggerConfig)('huxy')),
      {port: n, ssl: i} = e;
    (await h(n, e.host)) || ((e.port = Number(n) + 1), r.warn(`\u7AEF\u53E3 ${n} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${e.port}`));
    let a = y();
    await Y(a, e, r);
    let l;
    (i
      ? (L(i) === 'object' ||
          (r.error({ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}}, '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}'), process.exit(1)),
        (e.protocol = 'https'),
        (l = J.createServer(i, a)),
        N((u, d) => {
          (d.writeHead(301, {Location: `${e.protocol}://${u.headers.host}${u.url}`}), d.end());
        }).listen(80))
      : (l = N(a)),
      I(l, e, r));
    try {
      await A(l, e);
    } catch (m) {
      (r.error({err: m}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25'), process.exit(1));
    }
    try {
      await o?.(e, a, l, r);
    } catch (m) {
      (r.error({err: m}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${m.message}`), process.exit(1));
    }
    return (Z(a, e), {app: a, httpServer: l, config: e, logger: r});
  },
  M = q;
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
      contentSecurityPolicy: {directives: {defaultSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], scriptSrc: ["'self'", "'unsafe-eval'"], imgSrc: ["'self'", 'data:', 'https:']}},
      crossOriginEmbedderPolicy: !1,
    },
    logLevel: process.env.LOG_LEVEL || 30,
  },
  C = ee;
var te = (t, o, s) =>
    M({...C, ...t}, async (e, r, n, i) => {
      let {port: p, host: a, nodeEnv: l, basepath: m, appName: u = 'HuxyServer', protocol: d} = e;
      if (!s) {
        let k = f()
          .filter(S => S !== a)
          .map(S => `${d}://${S}:${p}${m}`);
        (i.info($(u)),
          i.info(`\u{1F680} \u670D\u52A1\u8FD0\u884C\u5728\u3010${l}\u3011\u73AF\u5883: ${d}://${a}:${p}${m}`),
          i.info(`-----------------[${c()}]------------------`),
          i.info({ips: k}, '\u672C\u5730\u5730\u5740'));
      }
      await o?.(e, r, n, i);
    }),
  v = te;
import ne from 'express';
import {fileURLToPath as oe} from 'node:url';
import {dirname as se, resolve as re} from 'node:path';
var P = (t = import.meta.url) => se(oe(t)),
  w = (...t) => re(P(), ...t),
  D = w;
var ie = {port: 9e3, host: 'localhost', basepath: '/', buildPath: './build'},
  ae = t => (t ? (t.endsWith('/') ? t : `${t}/`) : '/'),
  ce = (t, o) =>
    v({...ie, ...t}, async (s, e, r, n) => {
      await o?.(s, e, r, n);
      let {basepath: i, buildPath: p} = s;
      (i !== '/' &&
        e.get('/', (m, u, d) => {
          if (m.path === '/') return u.redirect(i);
          d();
        }),
        e.use(i, ne.static(p, {...s.staticCache})));
      let a = ae(i),
        l = new RegExp(`^${a.replace(/\//g, '\\/')}(.*)$`);
      e.get(l, (m, u) => {
        u.sendFile(D(p, 'index.html'));
      });
    }),
  H = ce;
var Ye = {startServer: v, startStatic: H, createLogger: x, dateTime: c, localIPs: f, nodeArgs: T, getEnvConfig: g, checkPort: h, getDirName: P, resolvePath: w};
export {h as checkPort, x as createLogger, c as dateTime, Ye as default, P as getDirName, g as getEnvConfig, f as localIPs, T as nodeArgs, w as resolvePath, v as startServer, H as startStatic};
