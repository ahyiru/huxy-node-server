import E from 'express';
import K from 'cors';
import {rateLimit as z, ipKeyGenerator as B} from 'express-rate-limit';
import X from 'compression';
import {createServer as O} from 'node:http';
import Q from 'node:https';
import D from 'node:os';
import H from 'node:net';
var a = (e = new Date()) => e.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  S = e => Object.prototype.toString.call(e).slice(8, -1).toLowerCase(),
  f = e => {
    let r = e ? 'https' : 'http',
      o = D.networkInterfaces(),
      t = [];
    return (Object.keys(o).map(i => t.push(...o[i])), t.filter(i => i.family === 'IPv4').map(i => i.address));
  },
  T = e => {
    let r = e ?? process.argv.slice(2) ?? [],
      o = {};
    return (
      r.map(t => {
        let [s, i] = t.split('=');
        o[s] = i;
      }),
      o
    );
  },
  j = {
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
  U = (e, r, o) => {
    let [t, s] = e.split('.');
    t && s ? (o[t] || (o[t] = {}), (o[t][s] = r)) : (o[t] = r);
  },
  G = e => {
    let {connectSrc: r, ...o} = e;
    if (!r) return o;
    (o.helmet.contentSecurityPolicy || (o.helmet.contentSecurityPolicy = {}), o.helmet.contentSecurityPolicy.directives || (o.helmet.contentSecurityPolicy.directives = {}));
    let t = typeof r == 'string' ? r.split(',').map(s => s.trim()) : Array.isArray(r) ? r : [];
    return ((o.helmet.contentSecurityPolicy.directives.connectSrc = [...o.helmet.contentSecurityPolicy.directives.connectSrc, ...t]), o);
  },
  h = (e = {}, r = j) => {
    let {env: o} = process;
    Object.keys(r).map(s => {
      let i = o[s] ?? e[s];
      i && U(r[s], i, e);
    });
    let t = {...e, ...T()};
    return ((t.port = t.staticPort || t.port), (t.isDev = t.nodeEnv === 'development'), (t.protocol = 'http'), G(t));
  },
  g = (e, r = '127.0.0.1') =>
    new Promise(o => {
      let t = H.createServer();
      (t.once('error', s => {
        (t.close(), o((s.code === 'EADDRINUSE', !1)));
      }),
        t.once('listening', () => {
          (t.close(), o(!0));
        }),
        t.listen(Number(e), r));
    }),
  I = (e, r = {}, o) => {
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
      process.on('unhandledRejection', (s, i) => {
        (o.fatal({reason: s, promise: i}, '\u26A0\uFE0F \u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'), process.exit(1));
      }));
  },
  L = (e, {port: r = 3e3, host: o = '0.0.0.0'} = {}) =>
    new Promise((t, s) => {
      (e.once('error', s), e.once('listening', () => t(e)), e.listen(r, o));
    }),
  A = (e, r = 56) => {
    let o = e.length,
      t = r - o,
      s = ~~(t / 2);
    return `${'-'.repeat(s)}${e}${'-'.repeat(t - s)}`;
  };
var F =
  (e = {}) =>
  async (r = 'huxy') => {
    let {logLevel: o, transportOpt: t, ...s} = e,
      i = (await import('pino')).default,
      n = i({
        name: r,
        level: o ?? 'info',
        formatters: {level: c => ({level: c})},
        timestamp: i.stdTimeFunctions.isoTime,
        base: null,
        transport: {target: 'pino-pretty', options: {colorize: !0, levelFirst: !0, ...t}, ignore: 'pid,hostname,level,time', translateTime: 'SYS:yyyy-mm-dd HH:MM:ss'},
        ...s,
      });
    return ((n.isPino = !0), n);
  };
var v = F;
var $ = (e, r) => (o, t, s) => {
    (r.error({message: 'Not Found', timestamp: a(), url: o.originalUrl, method: o.method, ip: o.ip, userAgent: o.get('User-Agent')}, '\u627E\u4E0D\u5230\u8DEF\u5F84'),
      t.status(404).json({success: !1, status: 404, url: o.originalUrl, message: `\u8DEF\u7531 [${o.method} ${o.originalUrl}] \u4E0D\u5B58\u5728`, timestamp: a()}));
  },
  R = (e, r) => (o, t, s, i) => {
    let n = o.status || 500,
      c = o.message;
    (r.error({message: c, timestamp: a(), stack: o.stack, url: t.originalUrl, method: t.method, ip: t.ip, userAgent: t.get('User-Agent')}, '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF'),
      s.status(n).json({success: !1, message: (e.isDev, c), stack: e.isDev ? o.stack : void 0, timestamp: a()}));
  };
import {Router as V} from 'express';
var W = e => {
    let r = V();
    return (
      r.use('/health', (o, t) => {
        t.status(200).json({status: 'OK', timestamp: a(), environment: e.nodeEnv, uptime: process.uptime(), memoryUsage: process.memoryUsage(), pid: process.pid});
      }),
      r.get('/', (o, t) => {
        t.status(200).json({message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D', timestamp: a(), environment: e.nodeEnv});
      }),
      r
    );
  },
  b = W;
var J = async (e, r = {}, o) => {
    if ((e.disable('x-powered-by'), e.set('trust proxy', r.trustProxy ?? !0), o.isPino)) {
      let t = (await import('pino-http')).default;
      e.use(t({logger: o, quietReqLogger: !0, autoLogging: !1, genReqId: !1}));
    } else
      e.use((t, s, i) => {
        t.log = o;
      });
    if ((e.use(X()), e.use(K(r.cors)), r.helmet)) {
      let t = (await import('helmet')).default;
      e.use(t(S(r.helmet) === 'object' ? r.helmet : {}));
    }
    (e.use(r.apiPrefix, z({keyGenerator: t => B(t.ip) || t.headers['x-huxy-auth'] || t.headers['x-api-key'] || t.headers.authorization, ...r.rateLimit})),
      e.use(E.json({limit: '20mb'})),
      e.use(E.urlencoded({extended: !0, limit: '20mb'})));
  },
  Y = (e, r = {}, o) => {
    (e.use(b(r)), e.use($(r, o)), e.use(R(r, o)));
  },
  Z = async (e = {}, r) => {
    let {logger: o, ...t} = h(e),
      s = o ?? (await v(t.loggerConfig)('huxy')),
      {port: i, ssl: n} = t;
    (await g(i, t.host)) || ((t.port = Number(i) + 1), s.warn(`\u7AEF\u53E3 ${i} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${t.port}`));
    let p = E();
    await J(p, t, s);
    let l;
    (n
      ? (S(n) === 'object' ||
          (s.error({ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}}, '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}'), process.exit(1)),
        (t.protocol = 'https'),
        (l = Q.createServer(n, p)),
        O((u, d) => {
          (d.writeHead(301, {Location: `${t.protocol}://${u.headers.host}${u.url}`}), d.end());
        }).listen(80))
      : (l = O(p)),
      I(l, t, s));
    try {
      await L(l, t);
    } catch (m) {
      (s.error({err: m}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25'), process.exit(1));
    }
    try {
      await r?.(t, p, l, s);
    } catch (m) {
      (s.error({err: m}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${m.message}`), process.exit(1));
    }
    return (Y(p, t, s), {app: p, httpServer: l, config: t, logger: s});
  },
  _ = Z;
var q = {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    basepath: process.env.BASEPATH || '/',
    apiPrefix: '/api',
    cors: {origin: process.env.CORS_ORIGIN?.split(',') || '*'},
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000', 10),
      limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '150', 10),
      skip: e => {
        let {path: r} = e;
        return !!(r.startsWith('/static/') || /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/i.test(r) || r === '/health' || r === '/ready');
      },
      message: {message: '\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5'},
    },
    logLevel: process.env.LOG_LEVEL || 30,
  },
  N = q;
var tt = (e, r, o) =>
    _({...N, ...e}, async (t, s, i, n) => {
      let {port: c, host: p, nodeEnv: l, basepath: m, appName: u = 'HuxyServer', protocol: d} = t;
      if (!o) {
        let k = f()
          .filter(y => y !== p)
          .map(y => `${d}://${y}:${c}${m}`);
        (n.info(A(u)),
          n.info(`\u{1F680} \u670D\u52A1\u8FD0\u884C\u5728\u3010${l}\u3011\u73AF\u5883: ${d}://${p}:${c}${m}`),
          n.info(`-----------------[${a()}]------------------`),
          n.info({ips: k}, '\u672C\u5730\u5730\u5740'));
      }
      await r?.(t, s, i, n);
    }),
  x = tt;
import st from 'express';
import {fileURLToPath as et} from 'node:url';
import {dirname as ot, resolve as rt} from 'node:path';
var P = (e = import.meta.url) => ot(et(e)),
  w = (...e) => rt(P(), ...e),
  C = w;
var it = {port: 9e3, host: 'localhost', basepath: '/', buildPath: './build'},
  nt = e => (e ? (e.endsWith('/') ? e : `${e}/`) : '/'),
  at = (e, r) =>
    x({...it, ...e}, async (o, t, s, i) => {
      await r?.(o, t, s, i);
      let {basepath: n, buildPath: c} = o;
      (n !== '/' &&
        t.get('/', (m, u, d) => {
          if (m.path === '/') return u.redirect(n);
          d();
        }),
        t.use(n, st.static(c, {...o.staticCache})));
      let p = nt(n),
        l = new RegExp(`^${p.replace(/\//g, '\\/')}(.*)$`);
      t.get(l, (m, u) => {
        u.sendFile(C(c, 'index.html'));
      });
    }),
  M = at;
var zt = {startServer: x, startStatic: M, createLogger: v, dateTime: a, localIPs: f, nodeArgs: T, getEnvConfig: h, checkPort: g, getDirName: P, resolvePath: w};
export {g as checkPort, v as createLogger, a as dateTime, zt as default, P as getDirName, h as getEnvConfig, f as localIPs, T as nodeArgs, w as resolvePath, x as startServer, M as startStatic};
