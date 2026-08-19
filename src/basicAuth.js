var y = Object.defineProperty;
var A = (s, n, t) => () => {
  if (t) throw t[0];
  try {
    return (s && (n = s((s = 0))), n);
  } catch (r) {
    throw ((t = [r]), r);
  }
};
var b = (s, n) => {
  for (var t in n) y(s, t, {get: n[t], enumerable: !0});
};
var l = {};
b(l, {basicAuthMiddleware: () => x});
import {timingSafeEqual as d} from 'node:crypto';
var B,
  g,
  x,
  h = A(() => {
    ((B = (s, n) => {
      let t = Buffer.from(s ?? '', 'utf8'),
        r = Buffer.from(n ?? '', 'utf8');
      return t.length !== r.length ? (d(t, Buffer.alloc(t.length)), !1) : d(t, r);
    }),
      (g = s => {
        if (!s?.startsWith('Basic ')) return null;
        let n = Buffer.from(s.slice(6), 'base64').toString('utf8'),
          t = n.indexOf(':');
        return t === -1 ? null : {username: n.slice(0, t), password: n.slice(t + 1)};
      }),
      (x = ({realm: s = 'Restricted', users: n, authorize: t, skip: r, unauthorizedResponse: c} = {}) => {
        let m = e =>
            typeof r == 'function' ? r(e)
            : r instanceof RegExp ? r.test(e.path)
            : Array.isArray(r) ? r.includes(e.path)
            : !1,
          p = (e, a, o) => {
            if (typeof t == 'function') return t(e, a, o);
            if (n) {
              let u = n[e];
              return u !== void 0 && B(a, u);
            }
            return !1;
          },
          f = (e, a) => {
            e.set('WWW-Authenticate', `Basic realm="${s}", charset="UTF-8"`);
            let o = typeof c == 'function' ? c(a) : void 0;
            e.status(401).send(o);
          };
        return async (e, a, o) => {
          if (m(e)) return o();
          let u = e.headers['proxy-authorization'] || e.headers.authorization,
            i = g(u);
          if (!i) return f(a, e);
          try {
            if (!(await p(i.username, i.password, e))) return f(a, e);
            ((e.basicAuthInfo = {username: i.username}), o());
          } catch {
            a.status(500).end();
          }
        };
      }));
  });
var w = async (s, n) => {
  let {basicAuthMiddleware: t} = await Promise.resolve().then(() => (h(), l));
  n.use(
    t({
      realm: 'Restricted',
      unauthorizedResponse: r => ({message: '\u672A\u6388\u6743\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\uFF01'}),
      users: {admin: '123456'},
      ...s,
    }),
  );
};
export {w as basicAuth};
