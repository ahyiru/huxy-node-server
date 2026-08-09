import T from 'express';
import B from 'cors';
import {rateLimit as X, ipKeyGenerator as Q} from 'express-rate-limit';
import J from 'compression';
import {createServer as O} from 'node:http';
import Y from 'node:https';
var C = async (o = {}, r) => {
    let t = (await import('pino')).default,
      e = r === 'development',
      s = t({
        name: 'Huxy',
        level: 'info',
        timestamp: t.stdTimeFunctions.isoTime,
        base: e ? void 0 : {},
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.headers["x-api-key"]',
            'body.password',
            '*.token',
          ],
          remove: !0,
        },
        transport:
          e ?
            {
              target: 'pino-pretty',
              options: {colorize: !0, translateTime: 'SYS:yyyy-mm-dd HH:MM:ss', ignore: 'pid,hostname,name'},
            }
          : void 0,
        ...o,
      });
    return ((s.isPino = !0), s);
  },
  h = C;
import D from 'node:os';
import U from 'node:net';
var p = (o = new Date()) => o.toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: !1}),
  S = o => Object.prototype.toString.call(o).slice(8, -1).toLowerCase(),
  v = o => {
    let r = o ? 'https' : 'http',
      t = D.networkInterfaces(),
      e = [];
    return (Object.keys(t).map(i => e.push(...t[i])), e.filter(i => i.family === 'IPv4').map(i => i.address));
  },
  E = o => {
    let r = o ?? process.argv.slice(2) ?? [],
      t = {};
    return (
      r.map(e => {
        let [s, i] = e.split('=');
        t[s] = i;
      }),
      t
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
  V = (o, r, t) => {
    let [e, s] = o.split('.');
    e && s ? (t[e] || (t[e] = {}), (t[e][s] = r)) : (t[e] = r);
  },
  W = o => {
    let {connectSrc: r, ...t} = o;
    if (!r) return t;
    (t.helmet.contentSecurityPolicy || (t.helmet.contentSecurityPolicy = {}),
      t.helmet.contentSecurityPolicy.directives || (t.helmet.contentSecurityPolicy.directives = {}));
    let e =
      typeof r == 'string' ? r.split(',').map(s => s.trim())
      : Array.isArray(r) ? r
      : [];
    return (
      (t.helmet.contentSecurityPolicy.directives.connectSrc = [
        ...t.helmet.contentSecurityPolicy.directives.connectSrc,
        ...e,
      ]),
      t
    );
  },
  F = o =>
    (o || '').length < 2 ? '/'
    : o.endsWith('/') ? o.slice(0, -1)
    : o,
  x = (o = {}, r = G) => {
    let {env: t} = process;
    Object.keys(r).map(s => {
      let i = t[s] ?? o[s];
      i && V(r[s], i, o);
    });
    let e = {...o, ...E()};
    return (
      (e.port = e.staticPort || e.port),
      (e.isDev = e.nodeEnv === 'development'),
      (e.basepath = F(e.basepath)),
      (e.protocol = 'http'),
      W(e)
    );
  },
  g = o =>
    new Promise(r => {
      let t = U.createServer();
      (t.once('error', e => {
        (t.close(), r((e.code === 'EADDRINUSE', !1)));
      }),
        t.once('listening', () => {
          (t.close(), r(!0));
        }),
        t.listen(Number(o)));
    }),
  w = (o, r = {}, t) => {
    let e = s => {
      (t.warn(`\u6536\u5230 ${s} \u4FE1\u53F7, \u{1F6D1} \u6B63\u5728\u5173\u95ED\u670D\u52A1\u5668...`),
        o.close(async () => {
          (t.info('\u{1F44B} \u670D\u52A1\u5668\u5DF2\u5173\u95ED'), await r.shutdown?.(), process.exit(0));
        }),
        setTimeout(() => {
          (t.error('\u274C \u5F3A\u5236\u5173\u95ED\u670D\u52A1\u5668'), process.exit(1));
        }, 5e3));
    };
    (process.on('SIGTERM', () => e('SIGTERM')),
      process.on('SIGINT', () => e('SIGINT')),
      process.on('uncaughtException', s => {
        (t.fatal(s, `\u{1F4A5} \u672A\u6355\u83B7\u7684\u5F02\u5E38: ${s.message}`), process.exit(1));
      }),
      process.on('unhandledRejection', (s, i) => {
        (t.fatal({reason: s, promise: i}, '\u26A0\uFE0F \u672A\u5904\u7406\u7684 Promise \u62D2\u7EDD'),
          process.exit(1));
      }));
  },
  I = (o, {port: r = 3e3, host: t} = {}) =>
    new Promise((e, s) => {
      (o.once('error', s), o.once('listening', () => e(o)), o.listen(r, t === 'localhost' ? '::' : t));
    }),
  L = (o, r = 56) => {
    let t = o.length,
      e = r - t,
      s = ~~(e / 2);
    return `${'-'.repeat(s)}${o}${'-'.repeat(e - s)}`;
  };
var A = (o, r) => (t, e, s) => {
    (r.error(
      {
        message: 'Not Found',
        timestamp: p(),
        url: t.originalUrl,
        method: t.method,
        ip: t.ip,
        userAgent: t.get('User-Agent'),
      },
      '\u627E\u4E0D\u5230\u8DEF\u5F84',
    ),
      e
        .status(404)
        .json({
          success: !1,
          status: 404,
          url: t.originalUrl,
          message: `\u8DEF\u7531 [${t.method} ${t.originalUrl}] \u4E0D\u5B58\u5728`,
          timestamp: p(),
        }));
  },
  $ = (o, r) => (t, e, s, i) => {
    let n = t.status || 500,
      c = t.message,
      u = '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF';
    (r.error(
      {
        message: c,
        timestamp: p(),
        stack: t.stack,
        url: e.originalUrl,
        method: e.method,
        ip: e.ip,
        userAgent: e.get('User-Agent'),
      },
      u,
    ),
      s.status(n).json({success: !1, message: o.isDev ? c : u, stack: o.isDev ? t.stack : void 0, timestamp: p()}));
  };
import {Router as K} from 'express';
var z = o => {
    let r = K();
    return (
      r.use('/health', (t, e) => {
        e.status(200).json({
          status: 'OK',
          timestamp: p(),
          environment: o.nodeEnv,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          pid: process.pid,
        });
      }),
      r.get('/', (t, e) => {
        e.status(200).json({
          message: 'Node.js \u670D\u52A1\u5668\u8FD0\u884C\u4E2D',
          timestamp: p(),
          environment: o.nodeEnv,
        });
      }),
      r
    );
  },
  b = z;
var Z = async (o, r = {}, t) => {
    if ((o.disable('x-powered-by'), o.set('trust proxy', r.trustProxy ?? !0), t.isPino)) {
      let e = (await import('pino-http')).default;
      o.use(e({logger: t, quietReqLogger: !0, autoLogging: !1}));
    } else
      o.use((e, s, i) => {
        e.log = t;
      });
    if ((o.use(J()), o.use(B(r.cors)), r.helmet)) {
      let e = (await import('helmet')).default;
      o.use(e(S(r.helmet) === 'object' ? r.helmet : {}));
    }
    (o.use(
      r.apiPrefix,
      X({
        keyGenerator: e => Q(e.ip) || e.headers['x-huxy-auth'] || e.headers['x-api-key'] || e.headers.authorization,
        ...r.rateLimit,
      }),
    ),
      o.use(T.json({limit: '20mb'})),
      o.use(T.urlencoded({extended: !0, limit: '20mb'})));
  },
  q = (o, r = {}, t) => {
    (o.use(b(r)), o.use(A(r, t)), o.use($(r, t)));
  },
  ee = async (o = {}, r) => {
    let {logger: t, ...e} = x(o),
      s = t ?? (await h(e.loggerConfig, e.nodeEnv)),
      {host: i, port: n, ssl: c} = e;
    ((!i || i === '::') && (e.host = 'localhost'),
      (await g(n)) ||
        ((e.port = Number(n) + 1),
        s.warn(`\u7AEF\u53E3 ${n} \u5DF2\u88AB\u5360\u7528\uFF0C\u73B0\u5728\u4F7F\u7528\u7AEF\u53E3 ${e.port}`)));
    let m = T();
    await Z(m, e, s);
    let a;
    (c ?
      (S(c) === 'object' ||
        (s.error(
          {ssl: {key: '/path/to/name.key', cert: '/path/to/name.pem'}},
          '\u26A0\uFE0F \u8BF7\u8BBE\u7F6E\u6709\u6548 SSL \u6216\u8BBE\u7F6E {ssl: false}',
        ),
        process.exit(1)),
      (e.protocol = 'https'),
      (a = Y.createServer(c, m)),
      O((f, d) => {
        (d.writeHead(301, {Location: `${e.protocol}://${f.headers.host}${f.url}`}), d.end());
      }).listen(80))
    : (a = O(m)),
      w(a, e, s));
    try {
      await I(a, e);
    } catch (l) {
      (s.error({err: l}, '\u26A0\uFE0F \u670D\u52A1\u5668\u542F\u52A8\u5931\u8D25'), process.exit(1));
    }
    try {
      await r?.(e, m, a, s);
    } catch (l) {
      (s.error({err: l}, `\u274C \u56DE\u8C03\u51FD\u6570\u9519\u8BEF\uFF1A${l.message}`), process.exit(1));
    }
    return (q(m, e, s), {app: m, httpServer: a, config: e, logger: s});
  },
  R = ee;
var te = {
    nodeEnv: process.env.NODE_ENV,
    isDev: process.env.NODE_ENV === 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST,
    basepath: process.env.BASEPATH || '/',
    apiPrefix: '/api',
    cors: {origin: process.env.CORS_ORIGIN?.split(',') || '*'},
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000', 10),
      limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '150', 10),
      skip: o => {
        let {path: r, url: t} = o;
        return !!(
          r.startsWith('/static/') ||
          /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/i.test(r) ||
          r === '/health' ||
          r === '/ready' ||
          t.includes('/socket.io') ||
          t.includes('EIO=')
        );
      },
      message: {message: '\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5'},
    },
    logLevel: process.env.LOG_LEVEL || 30,
  },
  _ = te;
var oe = (o, r, t) =>
    R({..._, ...o}, async (e, s, i, n) => {
      let {port: c, host: u, basepath: m, appName: a = 'HuxyServer', protocol: l} = e;
      if (!t) {
        let f = v()
          .filter(d => d !== u)
          .map(d => `${l}://${d}:${c}${m}`);
        (n.info(L(a)),
          n.info(`\u{1F680} \u670D\u52A1\u6B63\u5728\u8FD0\u884C: ${l}://${u}:${c}${m}`),
          n.info(`-----------------[${p()}]------------------`),
          n.info({ips: f}, '\u672C\u5730\u5730\u5740'));
      }
      await r?.(e, s, i, n);
    }),
  y = oe;
import se from 'express';
import {fileURLToPath as k} from 'node:url';
import {dirname as N, resolve as re} from 'node:path';
var M = (o = import.meta.url) => N(k(o)),
  P =
    (o = import.meta.url) =>
    (...r) =>
      re(N(k(o)), ...r),
  j = P;
var ie = j(import.meta.url),
  ne = (o, r) =>
    y(o, async (t, e, s, i) => {
      await r?.(t, e, s, i);
      let {basepath: n, buildPath: c} = t;
      (e.use(n, se.static(c, {...t.staticCache})),
        n !== '/' &&
          e.get(n, (m, a, l) => {
            a.redirect(308, `${n}/${m.search ?? ''}`);
          }));
      let u = n === '/' ? n : `${n}/`;
      e.get(`${u}{*splat}`, (m, a, l) => {
        if (a.headersSent) return l();
        a.sendFile(ie(c, 'index.html'));
      });
    }),
  H = ne;
var Fe = {
  startServer: y,
  startStatic: H,
  createLogger: h,
  dateTime: p,
  localIPs: v,
  nodeArgs: E,
  getEnvConfig: x,
  checkPort: g,
  getDirName: M,
  resolvePath: P,
};
export {
  g as checkPort,
  h as createLogger,
  p as dateTime,
  Fe as default,
  M as getDirName,
  x as getEnvConfig,
  v as localIPs,
  E as nodeArgs,
  P as resolvePath,
  y as startServer,
  H as startStatic,
};
