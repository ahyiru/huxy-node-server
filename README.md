# Huxy Node Server

[![Node.js Version](https://img.shields.io/badge/node.js-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Express.js](https://img.shields.io/badge/express.js-5.x-blue)](https://expressjs.com/)

一个精炼、高性能的 Express.js 服务器模板，为现代 Node.js 应用程序设计，提供灵活的功能和最佳实践。

## 🚀 特性

### 核心功能
- **现代 ES 模块支持**：使用 `"type": "module"` 完全支持 ES Modules
- **高性能日志**：集成 Pino 日志系统，支持彩色输出和多级别日志
- **安全防护**：内置 Helmet 安全中间件，提供 CSP、XSS 等多种安全防护
- **请求限制**：基于 IP 的请求速率限制，防止 DDoS 和暴力攻击
- **跨域支持**：灵活的 CORS 配置，支持多域名和凭证
- **压缩支持**：自动 GZIP 压缩响应，减少带宽使用
- **健康检查**：内置 `/health` 端点，监控服务器状态
- **优雅关闭**：处理 SIGTERM 和 SIGINT 信号，确保服务器优雅关闭

### 生产环境特性
- **环境变量支持**：通过 dotenv 管理配置，支持 `.env` 文件
- **错误处理**：全局错误处理中间件，提供详细错误日志
- **请求日志**：详细的 HTTP 请求日志，包括响应时间、状态码等
- **端口检查**：自动检测端口是否被占用，并自动选择可用端口
- **内存监控**：实时监控服务器内存使用情况
- **多网络接口支持**：自动检测本地 IP 地址，支持多网卡环境

### 开发者友好
- **热重载**：开发环境支持 `--watch` 模式，自动重载代码
- **详细文档**：完整的 API 文档和使用示例
- **模块化设计**：清晰的代码结构，易于扩展和定制
- **TypeScript 友好**：代码结构适合 TypeScript 迁移

## 📦 安装

```bash
# 通过 npm 安装
npm install huxy-node-server

# 或者通过 yarn 安装
yarn add huxy-node-server

# 或者通过 pnpm 安装
pnpm add huxy-node-server
```

## 🚀 快速开始

### 基本使用

```javascript
import { startServer } from 'huxy-node-server';

// 启动服务器
const { app, config, httpServer } = await startServer({
  port: 3000,
  host: '0.0.0.0',
  basepath: '/webui',
  // 其他配置...
}, (config, app, httpServer) => {
  // 可以在这里添加自定义路由
  app.get('/hello', (req, res) => {
    res.json({ message: 'Hello World!' });
  });
});
```

### 启用 SSL

```javascript
const options = {
  key: '/path/to/name.key',
  cert: '/path/to/name.pem',
};
startServer({
  port: 3000,
  host: '0.0.0.0',
  ssl: options,
});
```

### 静态文件服务

```javascript
import { startStatic } from 'huxy-node-server';

// 启动静态文件服务器
const server = await startStatic({
  port: 9000,
  basepath: '/',
  buildPath: './dist',  // 静态文件目录
});
```

## 🛠️ 配置选项

### 服务器配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `port` | number | 3000 | 服务器端口 |
| `host` | string | '0.0.0.0' | 服务器主机 |
| `basepath` | string | '/' | 基础路径前缀 |
| `apiPrefix` | string | '/api' | API前缀 |
| `nodeEnv` | string | 'development' | 运行环境 |
| `appName` | string | 'HuxyServer' | 应用名称 |

### 安全配置

```javascript
{
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    },
    crossOriginEmbedderPolicy: false
  }
}
```

### CORS 配置

```javascript
{
  cors: {
    origin: ['http://example.com', 'http://localhost:3000'], // 或 '*'
    credentials: true
  }
}
```

### 请求速率限制

```javascript
{
  rateLimit: {
    windowMs: 900000, // 15 分钟
    limit: 100, // 每个窗口内最大请求数
    message: {
      error: '请求过于频繁，请稍后再试'
    }
  }
}
```

### 日志配置

```javascript
{
  logLevel: 30, // 日志级别 (10=trace, 20=debug, 30=info, 40=warn, 50=error, 60=fatal)
}
```

## 🌍 环境变量

可以通过环境变量配置服务器：

```bash
# .env 文件
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
BASEPATH=/
API_PREFIX=/api
CORS_ORIGIN=http://example.com,http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=30
```

或者通过命令行参数：

```bash
node server.js port=3000 host=localhost
```

## 📂 目录结构

```
.
├── src/
│   ├── app.js              # Express 应用配置
│   ├── config.js           # 默认配置
│   ├── server.js           # 服务器启动逻辑
│   ├── routes.js           # 默认路由
│   ├── middleware.js       # 中间件集合
│   ├── logger.js           # 日志系统
│   ├── utils.js            # 工具函数
│   ├── staticServer.js     # 静态文件服务器
│   └── resolvePath.js      # 路径解析工具
├── example.js             # 使用示例
└── package.json
```

## 🔧 高级用法

### 自定义中间件

```javascript
import { startServer } from 'huxy-node-server';
import customMiddleware from './customMiddleware';

const { app } = await startServer({
  port: 3000,
}, (config, app) => {
  // 添加自定义中间件
  app.use(customMiddleware);
  
  // 添加自定义路由
  app.get('/custom', (req, res) => {
    res.json({ custom: 'route' });
  });
});
```

### 自定义错误处理

```javascript
import { startServer } from 'huxy-node-server';

const { app } = await startServer({
  port: 3000,
}, (config, app) => {
  // 添加自定义错误处理
  app.use((err, req, res, next) => {
    if (err instanceof CustomError) {
      res.status(400).json({ error: err.message });
    } else {
      next(err);
    }
  });
});
```

### 自定义日志

```javascript
import { startServer, createLogger } from 'huxy-node-server';

const customLogger = createLogger('custom-module', {
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

customLogger.info('自定义日志消息');
```

### 与数据库集成

```javascript
import { startServer } from 'huxy-node-server';
import mongoose from 'mongoose';

const { app } = await startServer({
  port: 3000,
}, async (config, app) => {
  // 连接到 MongoDB
  await mongoose.connect(config.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // 添加数据库中间件
  app.use((req, res, next) => {
    req.db = mongoose.connection;
    next();
  });
  
  // 添加 API 路由
  app.get('/api/users', async (req, res) => {
    const users = await req.db.collection('users').find().toArray();
    res.json({ success: true, data: users });
  });
});
```

## 📊 API 文档

### `startServer(config, afterHandler, beforeHandler)`

启动 Express 服务器

**参数:**

- `config` (Object): 服务器配置对象
- `afterHandler` (Function): 可选的回调函数，在API启动后调用
- `beforeHandler` (Function): 可选的回调函数，在API启动前调用

**返回:** Promise<{app, config, httpServer}>

### `startStatic(config, afterHandler, beforeHandler)`

启动静态文件服务器

**参数:**

- `config` (Object): 服务器配置对象
- `afterHandler` (Function): 可选的回调函数，在API启动后调用
- `beforeHandler` (Function): 可选的回调函数，在API启动前调用

**返回:** Promise<{app, config, httpServer}>

### `createLogger(name, customConfig)`

创建自定义日志实例

**参数:**

- `name` (String): 日志实例名称
- `customConfig` (Object): 自定义配置

**返回:** Pino 日志实例

### `logger`

默认日志实例

### 工具函数

- `dateTime()`: 获取当前时间字符串
- `localIPs()`: 获取本地 IP 地址列表
- `nodeArgs()`: 解析命令行参数
- `getEnvConfig()`: 获取环境变量配置
- `checkPort()`: 检查端口是否可用
- `resolvePath()`: 解析文件路径

## 🛡️ 安全最佳实践

### 1. 环境变量

永远不要在代码中硬编码敏感信息，使用环境变量：

```bash
# .env 文件
JWT_SECRET=your_secret_key_here
DATABASE_URL=your_database_url
```

### 2. HTTPS

在生产环境中，始终使用 HTTPS。可以使用反向代理（如 Nginx）或直接配置：

```javascript
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

https.createServer(options, app).listen(443);
```

### 3. 速率限制

根据您的应用需求调整速率限制：

```javascript
{
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 分钟
    limit: 100, // 每个 IP 每个窗口内最大请求数
    message: '太多请求，请稍后再试'
  }
}
```

### 4. CORS

在生产环境中，限制 CORS 来源：

```javascript
{
  cors: {
    origin: ['https://yourdomain.com', 'https://yourapp.com'],
    credentials: true
  }
}
```

### 5. 安全头

根据需要调整 Helmet 配置：

```javascript
{
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.example.com"],
        // 其他 CSP 指令...
      }
    }
  }
}
```

## 🚀 部署

### Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

构建并运行：

```bash
docker build -t huxy-server .
docker run -p 3000:3000 -d huxy-server
```

### PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start src/index.js --name huxy-server

# 保存进程列表
pm2 save

# 设置开机启动
pm2 startup
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## [代理服务配置](https://github.com/ahyiru/huxy-node-server/blob/main/docs/PROXY.md)

## 📝 许可证

MIT © [ahyiru](https://github.com/ahyiru/huxy-node-server/blob/main/LICENSE)

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📞 支持

如果您有任何问题或建议，请通过以下方式联系：

- GitHub Issues: https://github.com/ahyiru/huxy-node-server/issues
- 电子邮件: ah.yiru@egmail.com

## 📄 详细文档

- [文档索引](https://github.com/ahyiru/huxy-node-server/blob/main/docs/INDEX.md)
- [API 文档](https://github.com/ahyiru/huxy-node-server/blob/main/docs/API.md)
- [PROXY 文档](https://github.com/ahyiru/huxy-node-server/blob/main/docs/PROXY.md)
- [配置指南](https://github.com/ahyiru/huxy-node-server/blob/main/docs/CONFIGURATION.md)
- [部署指南](https://github.com/ahyiru/huxy-node-server/blob/main/docs/DEPLOYMENT.md)
- [更新日志](https://github.com/ahyiru/huxy-node-server/blob/main/CHANGELOG.md)

## 📚 相关资源

- [Express.js 文档](https://expressjs.com/)
- [Pino 日志文档](https://getpino.io/)
- [Helmet 安全文档](https://helmetjs.github.io/)
- [Node.js 文档](https://nodejs.org/docs/)

---

✨ **Huxy Node Server** - 为现代 Web 应用程序提供强大、可靠的后端解决方案！