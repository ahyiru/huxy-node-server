# 配置指南

Huxy Node Server 提供了灵活的配置系统，支持环境变量、命令行参数和代码配置。本文档详细介绍所有可用的配置选项及其用法。

## 目录

- [配置系统概述](#配置系统概述)
- [环境变量](#环境变量)
- [命令行参数](#命令行参数)
- [代码配置](#代码配置)
- [配置优先级](#配置优先级)
- [默认配置](#默认配置)
- [高级配置](#高级配置)
- [多环境配置](#多环境配置)
- [配置示例](#配置示例)
- [配置验证](#配置验证)

## 配置系统概述

Huxy Node Server 使用分层配置系统，允许通过多种方式配置服务器：

1. **环境变量** - 通过 `.env` 文件或系统环境变量
2. **命令行参数** - 通过启动命令传递
3. **代码配置** - 通过 JavaScript 对象传递

## 环境变量

环境变量是配置服务器的主要方式，特别适合生产环境。

### 支持的环境变量

| 变量名 | 类型 | 默认值 | 描述 |
|--------|------|---------|------|
| `NODE_ENV` | string | `development` | 环境名称 (development, production, test) |
| `PORT` | number | `3000` | 服务器端口 |
| `HOST` | string | `0.0.0.0` | 服务器主机地址 |
| `BASEPATH` | string | `/` | 基础路径 |
| `CORS_ORIGIN` | string | `*` | CORS 允许的来源，多个用逗号分隔 |
| `RATE_LIMIT_WINDOW_MS` | number | `900000` | 速率限制时间窗口（毫秒） |
| `RATE_LIMIT_MAX_REQUESTS` | number | `100` | 速率限制最大请求数 |
| `LOG_LEVEL` | number | `30` | 日志级别 (10-60) |
| `API_PREFIX` | string | - | API 前缀（可选） |
| `JWT_SECRET` | string | - | JWT 秘钥（可选） |
| `AUTH_TOKEN` | string | - | 身份验证令牌（可选） |

### 使用 `.env` 文件

创建 `.env` 文件：

```env
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
BASEPATH=/
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=30
```

### 环境变量加载

服务器使用 `dotenv` 自动加载 `.env` 文件中的变量。

## 命令行参数

可以通过命令行参数覆盖配置：

```bash
# 直接传递参数
node src/index.js port=8080 host=localhost

# 通过 npm 脚本
npm start -- port=8080 host=localhost

# 多个参数
NODE_ENV=production npm start -- port=8080 host=localhost
```

### 参数格式

- 使用 `key=value` 格式
- 可以使用驼峰式或下划线格式
- 支持嵌套配置（例如 `cors.origin`）

## 代码配置

可以通过 JavaScript 对象传递配置：

```javascript
import {startServer} from './src/index.js';

const config = {
  port: 8080,
  host: 'localhost',
  nodeEnv: 'development',
  basepath: '/api',
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true
  },
  rateLimit: {
    windowMs: 900000,
    limit: 100,
    message: {
      error: '请求过于频繁，请稍后再试'
    }
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"]
      }
    }
  },
  logLevel: 30
};

const {app, httpServer} = await startServer(config, (huxyConfig, app) => {
  console.log('服务器配置：', huxyConfig);
});
```

## 配置优先级

配置系统遵循以下优先级（从高到低）：

1. **命令行参数** - 最高优先级
2. **环境变量** - 第二优先级
3. **代码配置** - 第三优先级
4. **默认配置** - 最低优先级

这意味着命令行参数会覆盖环境变量，环境变量会覆盖代码配置，代码配置会覆盖默认配置。

## 默认配置

服务器的默认配置位于 `src/config.js`：

```javascript
const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV === 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  basepath: process.env.BASEPATH || '/',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    message: {
      error: '请求过于频繁，请稍后再试',
    },
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    },
    crossOriginEmbedderPolicy: false,
  },
  logLevel: process.env.LOG_LEVEL || 30,
};
```

## 高级配置

### 自定义中间件配置

```javascript
const customConfig = {
  ...defaultConfig,
  cors: {
    origin: ['https://yourdomain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分钟
    limit: 1000, // 每个 IP 每个窗口的最大请求数
    standardHeaders: true, // 返回速率限制信息在 `RateLimit-*` 头中
    legacyHeaders: false, // 禁用 `X-RateLimit-*` 头
  },
  helmet: {
    contentSecurityPolicy: false, // 禁用 CSP
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }
};
```

### 安全配置

```javascript
const secureConfig = {
  ...defaultConfig,
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.example.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.example.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    referrerPolicy: {policy: 'same-origin'},
    permissionsPolicy: {
      features: {
        geolocation: ["'self'"],
        camera: ["'none'"],
        microphone: ["'none'"]
      }
    }
  },
  cors: {
    origin: ['https://yourdomain.com'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400
  }
};
```

### 性能配置

```javascript
const performanceConfig = {
  ...defaultConfig,
  // 压缩配置
  compression: {
    level: 6, // 压缩级别 (0-9)
    threshold: 0, // 仅压缩大于此大小的响应
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  },
  // 缓存配置
  cache: {
    static: {
      maxAge: '1y',
      immutable: true
    },
    dynamic: {
      maxAge: '5m'
    }
  }
};
```

## 多环境配置

### 环境特定配置

```javascript
// config/development.js
export default {
  nodeEnv: 'development',
  logLevel: 10, // 更详细的日志
  cors: {
    origin: '*' // 开发环境允许所有来源
  }
};

// config/production.js
export default {
  nodeEnv: 'production',
  logLevel: 30,
  cors: {
    origin: ['https://yourdomain.com'] // 生产环境限制来源
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    limit: 1000
  }
};

// config/test.js
export default {
  nodeEnv: 'test',
  logLevel: 60, // 仅错误日志
  port: 3001 // 不同的测试端口
};
```

### 加载环境配置

```javascript
import {startServer} from './src/index.js';
import {getEnvConfig} from './src/utils.js';

const envConfig = getEnvConfig({
  // 基础配置
});

const {app} = await startServer(envConfig, (config, app) => {
  console.log(`Running in ${config.nodeEnv} mode`);
});
```

## 配置示例

### 开发环境配置

```env
# .env.development
NODE_ENV=development
PORT=3000
HOST=localhost
BASEPATH=/
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=10
```

### 生产环境配置

```env
# .env.production
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
BASEPATH=/api
CORS_ORIGIN=https://yourdomain.com,https://yourapp.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=30
```

### 测试环境配置

```env
# .env.test
NODE_ENV=test
PORT=3001
HOST=localhost
BASEPATH=/test
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10000
LOG_LEVEL=60
```

### Docker 配置

```env
# .env.docker
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
BASEPATH=/
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=30
```

## 配置验证

### 手动验证

```javascript
const validateConfig = (config) => {
  const errors = [];
  
  if (!config.port || config.port < 1024 || config.port > 65535) {
    errors.push('Invalid port number');
  }
  
  if (!config.host) {
    errors.push('Host is required');
  }
  
  if (config.logLevel < 10 || config.logLevel > 60) {
    errors.push('Log level must be between 10 and 60');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }
  
  return config;
};

const validatedConfig = validateConfig(config);
```

### 使用 Joi 验证

```javascript
import Joi from 'joi';

const configSchema = Joi.object({
  nodeEnv: Joi.string().valid('development', 'production', 'test').required(),
  port: Joi.number().integer().min(1024).max(65535).required(),
  host: Joi.string().required(),
  basepath: Joi.string().default('/'),
  cors: Joi.object({
    origin: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
    credentials: Joi.boolean().default(true)
  }),
  rateLimit: Joi.object({
    windowMs: Joi.number().integer().min(1000).default(900000),
    limit: Joi.number().integer().min(1).default(100),
    message: Joi.object({
      error: Joi.string().default('请求过于频繁，请稍后再试')
    })
  }),
  logLevel: Joi.number().integer().min(10).max(60).default(30)
});

const {value: validatedConfig, error} = configSchema.validate(config, {
  abortEarly: false,
  allowUnknown: true
});

if (error) {
  console.error('Configuration validation error:', error.details);
  process.exit(1);
}
```

## 配置管理最佳实践

### 1. 环境隔离

- 为每个环境（开发、测试、生产）维护单独的配置文件
- 绝不在生产环境使用开发配置
- 使用 `.env` 文件管理环境特定变量

### 2. 安全

- 绝不将敏感信息（密码、秘钥、API 令牌）提交到版本控制
- 使用环境变量或秘钥管理服务存储敏感数据
- 对生产配置使用最小权限原则

### 3. 版本控制

- 将配置模板和示例文件提交到版本控制
- 将实际配置文件添加到 `.gitignore`
- 使用 `.env.example` 文件记录所有需要的环境变量

### 4. 文档

- 记录所有配置选项及其用途
- 提供每个环境的示例配置
- 记录配置更改和原因

### 5. 验证

- 实现配置验证
- 在应用启动时验证配置
- 提供有意义的错误消息

### 6. 一致性

- 在所有环境中保持配置结构一致
- 使用相同的变量名
- 保持配置格式一致

## 故障排除

### 常见配置问题

1. **端口冲突**:
   - 错误: `Error: listen EADDRINUSE: address already in use`
   - 解决: 更改端口或停止使用该端口的其他进程

2. **无效端口**:
   - 错误: `Error: listen EINVAL: invalid argument`
   - 解决: 使用有效端口号（1024-65535）

3. **CORS 错误**:
   - 错误: `No 'Access-Control-Allow-Origin' header`
   - 解决: 检查 CORS_ORIGIN 配置

4. **速率限制不生效**:
   - 问题: 速率限制没有阻止请求
   - 解决: 检查 RATE_LIMIT_WINDOW_MS 和 RATE_LIMIT_MAX_REQUESTS 配置

5. **日志级别不生效**:
   - 问题: 日志级别没有按预期工作
   - 解决: 检查 LOG_LEVEL 配置（10-60）

### 调试配置

```javascript
import {startServer, getEnvConfig} from './src/index.js';

// 获取并打印最终配置
const finalConfig = getEnvConfig({
  port: 3000,
  // 其他配置...
});

console.log('Final configuration:', JSON.stringify(finalConfig, null, 2));

const {app} = await startServer(finalConfig, (config, app) => {
  console.log('Server started with config:', config);
});
```

## 配置参考

### 日志级别

| 级别 | 值 | 描述 |
|------|----|------|
| trace | 10 | 最详细的日志 |
| debug | 20 | 调试信息 |
| info | 30 | 一般信息 |
| warn | 40 | 警告 |
| error | 50 | 错误 |
| fatal | 60 | 致命错误 |

### 环境变量

| 环境 | 描述 |
|------|------|
| development | 开发环境，启用调试和详细日志 |
| production | 生产环境，优化性能和安全 |
| test | 测试环境，用于自动化测试 |

### 速率限制

- `windowMs`: 时间窗口（毫秒），例如 900000 = 15分钟
- `limit`: 每个时间窗口的最大请求数
- `message`: 超过限制时的响应消息

### CORS 配置

- `origin`: 允许的来源，可以是字符串、数组或 `*`
- `methods`: 允许的 HTTP 方法
- `allowedHeaders`: 允许的请求头
- `credentials`: 是否允许凭证
- `maxAge`: 预检请求的缓存时间

## 更新配置

### 热重载

服务器不支持热重载配置。更改配置后需要重启服务器：

```bash
# 使用 PM2
pm2 restart huxy-server

# 使用 Docker
docker restart huxy-server

# 手动
pkill -f "node src/index.js"
npm start
```

### 配置迁移

当更新服务器版本时，可能需要迁移配置：

1. 检查更新日志中的配置更改
2. 更新配置文件
3. 测试新配置
4. 逐步部署到生产环境

## 结论

Huxy Node Server 的配置系统设计灵活且强大，支持多种配置方法和环境。通过理解配置系统的工作方式和最佳实践，可以轻松自定义服务器以满足特定需求，同时保持安全性和性能。