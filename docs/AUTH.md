# `code-auth` — 邮箱验证码登录中间件

基于 Express 的邮箱验证码认证模块，提供完整的登录流程（邮箱输入 → 验证码校验），支持自定义页面、内存存储、速率限制和会话管理。适用于内部系统、管理后台或团队协作场景的轻量级身份验证。

---

## 特性

- ✅ 邮箱验证码登录（可配置有效期、长度、重试次数）
- ✅ 内存存储（含 TTL 自动过期）
- ✅ 内置 UI（邮箱表单 + 验证码表单）
- ✅ 会话持久化（基于 `express-session`）
- ✅ 路由保护中间件（`requireAuth`）
- ✅ Flash 消息提示（错误反馈）
- ✅ 支持 JSON 响应（用于 API 客户端）
- ✅ 可自定义 logo、标题、提示文案
- ✅ 灵活的邮箱白名单配置

---

## 安装

```bash
npm install huxy-node-server
```

基于 [`huxy-node-server`](https://www.npmjs.com/package/huxy-node-server) ，可参见文档。

---

## 快速开始

```javascript
import {startServer} from 'huxy-node-server';
import {codeAuth} from 'huxy-node-server/codeAuth';

const authConfig = {
  session: { secret: 'your-secret-key' },
  mail: {
    host: 'smtp.example.com',
    port: 587,
    auth: { user: 'user', pass: 'pass' },
    from: 'noreply@example.com',
  },
  allowedEmails: ['admin@example.com', 'team@example.com'],
};

const port = 8080;

startServer({
  port,
  proxys: [{
    target: 'http://localhost:3080',
  }],
  logger: console,
  serverLogger: (_, logger) => logger.info(`代理服务运行在 ${port} 端口`),
}, null, (_, app) => {
  codeAuth(authConfig, app);
});

```

访问 `/authCode/email` 开始登录流程。

---

## 配置选项

可通过环境变量或直接传入配置对象（优先级：`userConfig` > 默认值）。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `session.secret` | `string` | `''` | **必填**，用于签名 session cookie |
| `session.maxAge` | `number` | `30` | session 有效期（天） |
| `session.cookie` | `object` | `{ httpOnly: true, sameSite: 'lax' }` | 额外的 cookie 选项 |
| `code.ttl` | `number` | `300000` | 验证码有效期（毫秒） |
| `code.len` | `number` | `6` | 验证码长度 |
| `code.maxAttempts` | `number` | `5` | 最大尝试次数 |
| `mail.host` | `string` | `''` | **必填**，SMTP 服务器地址 |
| `mail.port` | `number` | `587` | SMTP 端口 |
| `mail.auth` | `object` | `{}` | **必填**，nodemailer 认证对象（user/pass 或 OAuth2） |
| `mail.from` | `string` | `''` | 发件人邮箱地址 |
| `mail.subject` | `string` | `undefined` | 邮件主题（可选） |
| `allowedEmails` | `string` / `Array` / `Set` | `null` | **必填**，白名单邮箱（见下方说明） |
| `authpath` | `string` | `'/authCode'` | 认证路由的挂载前缀 |
| `page` | `object` | `{}` | 自定义页面文案（见“自定义页面”） |

### 环境变量映射

| 环境变量 | 对应配置项 |
|----------|------------|
| `SESSION_SECRET` | `session.secret` |
| `SESSION_COOKIE_MAXAGE` | `session.maxAge`（天） |
| `CODE_TTL_MS` | `code.ttl` |
| `CODE_LENGTH` | `code.len` |
| `CODE_MAX_ATTEMPTS` | `code.maxAttempts` |
| `MAIL_HOST` | `mail.host` |
| `MAIL_PORT` | `mail.port` |
| `MAIL_AUTH` | JSON 字符串，如 `'{"user":"x","pass":"y"}'` |
| `MAIL_FROM` | `mail.from` |
| `ALLOWED_EMAILS` | 支持逗号或换行分隔，如 `'a@x.com,b@x.com'` |

### `allowedEmails` 格式

- **字符串**：以逗号或换行分隔的邮箱列表（自动转为小写）
- **数组**：`['a@x.com', 'b@x.com']`
- **Set**：`new Set(['a@x.com', 'b@x.com'])`

---

## 路由与端点

所有路由挂载在 `authpath`（默认 `/authCode`）下。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/authCode/email` | 显示邮箱输入表单 |
| POST | `/authCode/email` | 提交邮箱，发送验证码（若在白名单内） |
| GET | `/authCode/code` | 显示验证码输入表单 |
| POST | `/authCode/code` | 提交验证码，校验成功后创建会话 |
| GET | `/authCode/logout` | 销毁会话并重定向至 `/authCode/email` |


---

## 自定义页面

通过 `page` 配置项覆盖默认文案和 logo：

```javascript
const config = {
  // ... 其他配置
  page: {
    logo: '<svg>...</svg>',        // 自定义 SVG logo
    title: 'My Team',              // 显示在登录框的团队名
    tips: '输入您的企业邮箱',       // 提示文字
    footer: '© 2026 My Company',   // 页脚
  }
};
```

---

## 未授权访问保护

| 请求类型 | 行为 |
|----------|------|
| HTML（浏览器） | 重定向至 `/:authpath/email` |
| JSON（API） | 返回 `401 { error: '未授权', redirect: '/:authpath/email' }` |


---

## 存储与安全

- **存储**：验证码和尝试次数存储在内存 `Map` 中，服务重启即丢失。
- **会话**：基于 `express-session`，默认使用内存存储（生产环境建议改用 Redis 等持久化存储）。
- **防护**：
  - 验证码 TTL 自动过期
  - 最大尝试次数限制（超出后自动删除记录）
  - 邮箱白名单限制
  - 登录成功后自动清除验证码记录


---

## 注意事项

- 务必设置 `SESSION_SECRET`，否则启动会抛出错误。
- 必须配置有效的 SMTP 服务，否则无法发送验证码。
- 邮箱白名单不能为空，否则启动会抛出错误。
- 该模块仅适用于内部或小规模团队，如需更复杂的用户管理，请考虑扩展。


## License

MIT