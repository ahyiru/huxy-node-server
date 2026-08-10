# API 文档

Huxy Node Server 提供了灵活的 API 设计和集成能力。本文档介绍如何使用和扩展服务器的 API 功能。

## 目录

- [内置 API 端点](#内置-api-端点)
- [创建自定义 API](#创建自定义-api)
- [路由管理](#路由管理)
- [中间件](#中间件)
- [请求处理](#请求处理)
- [响应格式](#响应格式)
- [错误处理](#错误处理)
- [身份验证](#身份验证)
- [文件上传](#文件上传)
- [API 版本控制](#api-版本控制)
- [API 文档生成](#api-文档生成)

## 内置 API 端点

### 健康检查

```http
GET /health
```

**响应**:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01 12:00:00",
  "uptime": 123.45,
  "environment": "development",
  "memoryUsage": {
    "rss": 12345678,
    "heapTotal": 12345678,
    "heapUsed": 12345678,
    "external": 12345678
  },
  "pid": 12345
}
```

### 根路由

```http
GET /
```

**响应**:

```json
{
  "message": "Node.js 服务器运行中",
  "timestamp": "2024-01-01 12:00:00",
  "environment": "development"
}
```

## 创建自定义 API

### 基本示例

```javascript
import {startServer} from '../src/index.js';

const {app} = await startServer({
  port: 3000,
}, (config, app) => {
  // 简单 GET 路由
  app.get('/api/greet', (req, res) => {
    res.json({
      message: 'Hello World',
      timestamp: new Date().toISOString()
    });
  });
});
```

### 使用路由器

```javascript
import {Router} from 'express';
import {startServer} from '../src/index.js';

const apiRouter = Router();

// GET 路由
apiRouter.get('/users', (req, res) => {
  res.json({users: []});
});

// POST 路由
apiRouter.post('/users', (req, res) => {
  const {name, email} = req.body;
  // 创建用户逻辑...
  res.status(201).json({id: 1, name, email});
});

// PUT 路由
apiRouter.put('/users/:id', (req, res) => {
  const {id} = req.params;
  const updates = req.body;
  // 更新用户逻辑...
  res.json({id, ...updates});
});

// DELETE 路由
apiRouter.delete('/users/:id', (req, res) => {
  const {id} = req.params;
  // 删除用户逻辑...
  res.status(204).send();
});

const {app} = await startServer({
  port: 3000,
}, (config, app) => {
  app.use('/api', apiRouter);
});
```

## 路由管理

### 路由组织

推荐的路由组织结构：

```
src/
  routes/
    api/
      users.js
      posts.js
      auth.js
    web/
      home.js
      about.js
    index.js
```

### 动态路由加载

```javascript
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const loadRoutes = (app) => {
  const routesPath = path.join(__dirname, 'routes');
  
  fs.readdirSync(routesPath).forEach(file => {
    if (file.endsWith('.js')) {
      const route = await import(`./routes/${file}`);
      app.use(route.default || route);
    }
  });
};
```

## 中间件

### 内置中间件

服务器已经集成了以下中间件：

- `helmet()` - 安全头
- `cors()` - 跨域资源共享
- `rateLimit()` - 速率限制
- `compression()` - 响应压缩
- `express.json()` - JSON 解析
- `express.urlencoded()` - 表单解析
- `cacheMiddleware()` - 缓存控制

### 自定义中间件

```javascript
const {app} = await startServer({
  port: 3000,
}, (config, app) => {
  // 请求日志中间件
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // 身份验证中间件
  app.use('/api/private', (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader !== 'Bearer valid-token') {
      return res.status(401).json({error: 'Unauthorized'});
    }
    next();
  });
});
```

### 异步中间件

```javascript
import {asyncHandler} from '../src/middleware.js';

const {app} = await startServer({
  port: 3000,
}, (config, app) => {
  app.get('/api/data', asyncHandler(async (req, res) => {
    const data = await fetchDataFromDatabase();
    res.json(data);
  }));
});
```

## 请求处理

### 请求参数

```javascript
app.get('/api/users/:id', (req, res) => {
  // 路径参数
  const userId = req.params.id;
  
  // 查询参数
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  
  // 请求头
  const userAgent = req.headers['user-agent'];
  const authToken = req.headers['authorization'];
  
  res.json({userId, page, limit, userAgent});
});
```

### 请求体

```javascript
app.post('/api/users', (req, res) => {
  // JSON 请求体
  const userData = req.body;
  
  // 表单数据
  const formData = req.body;
  
  res.json({received: userData});
});
```

### 文件上传

```javascript
import multer from 'multer';

const upload = multer({dest: 'uploads/'});

app.post('/api/upload', upload.single('file'), (req, res) => {
  // req.file 包含文件信息
  // req.body 包含其他表单字段
  res.json({
    filename: req.file.filename,
    size: req.file.size
  });
});
```

## 响应格式

### 标准响应

```javascript
app.get('/api/users', (req, res) => {
  res.status(200).json({
    success: true,
    data: [],
    timestamp: new Date().toISOString()
  });
});
```

### 错误响应

```javascript
app.get('/api/error', (req, res) => {
  res.status(400).json({
    success: false,
    error: {
      code: 'BAD_REQUEST',
      message: 'Invalid request parameters',
      details: {}
    },
    timestamp: new Date().toISOString()
  });
});
```

### 分页响应

```javascript
app.get('/api/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const total = 100;
  const users = []; // 实际数据

  res.json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    timestamp: new Date().toISOString()
  });
});
```

## 错误处理

### 全局错误处理

服务器已经内置了全局错误处理中间件，会自动捕获和处理错误。

### 自定义错误

```javascript
class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

app.get('/api/error', (req, res, next) => {
  try {
    // 模拟错误
    throw new ApiError('Something went wrong', 400);
  } catch (err) {
    next(err); // 传递给全局错误处理器
  }
});
```

### 错误类型

```javascript
// 400 Bad Request
app.use((req, res, next) => {
  const error = new ApiError('Bad Request', 400);
  next(error);
});

// 401 Unauthorized
app.use((req, res, next) => {
  const error = new ApiError('Unauthorized', 401);
  next(error);
});

// 403 Forbidden
app.use((req, res, next) => {
  const error = new ApiError('Forbidden', 403);
  next(error);
});

// 404 Not Found
app.use((req, res, next) => {
  const error = new ApiError('Not Found', 404);
  next(error);
});

// 500 Internal Server Error
app.use((req, res, next) => {
  const error = new ApiError('Internal Server Error', 500);
  next(error);
});
```

## 身份验证

### 基本身份验证

```javascript
const basicAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({error: 'Authorization header missing'});
  }
  
  const [scheme, credentials] = authHeader.split(' ');
  
  if (scheme !== 'Basic') {
    return res.status(401).json({error: 'Invalid authentication scheme'});
  }
  
  const [username, password] = Buffer.from(credentials, 'base64').toString().split(':');
  
  if (username !== 'admin' || password !== 'password') {
    return res.status(401).json({error: 'Invalid credentials'});
  }
  
  next();
};

app.use('/api/secure', basicAuth);
```

### JWT 身份验证

```javascript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({error: 'Authorization header missing'});
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({error: 'Token missing'});
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({error: 'Invalid or expired token'});
  }
};

// 登录路由
app.post('/api/login', (req, res) => {
  const {username, password} = req.body;
  
  // 验证用户凭证...
  
  const token = jwt.sign({username, userId: 1}, JWT_SECRET, {expiresIn: '1h'});
  
  res.json({token});
});

// 受保护路由
app.use('/api/private', authenticateJWT);
```

### 角色基础访问控制 (RBAC)

```javascript
const checkRole = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({error: 'Unauthorized'});
  }
  
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({error: 'Forbidden'});
  }
  
  next();
};

// 管理员路由
app.get('/api/admin', authenticateJWT, checkRole(['admin']), (req, res) => {
  res.json({message: 'Admin dashboard'});
});

// 用户路由
app.get('/api/user', authenticateJWT, checkRole(['user', 'admin']), (req, res) => {
  res.json({message: 'User dashboard'});
});
```

## 文件上传

### 单文件上传

```javascript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({storage});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({error: 'No file uploaded'});
  }
  
  res.json({
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path
  });
});
```

### 多文件上传

```javascript
const upload = multer({storage});

app.post('/api/upload-multiple', upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({error: 'No files uploaded'});
  }
  
  res.json({
    files: req.files.map(file => ({
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    }))
  });
});
```

### 文件类型验证

```javascript
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
```

## API 版本控制

### 路由版本控制

```javascript
const v1Router = Router();
const v2Router = Router();

// v1 API
v1Router.get('/users', (req, res) => {
  res.json({version: 'v1', users: []});
});

// v2 API
v2Router.get('/users', (req, res) => {
  res.json({version: 'v2', users: []});
});

const {app} = await startServer({
  port: 3000,
}, (config, app) => {
  app.use('/api/v1', v1Router);
  app.use('/api/v2', v2Router);
});
```

### 请求头版本控制

```javascript
app.use('/api/users', (req, res, next) => {
  const version = req.headers['accept-version'] || '1.0';
  
  if (version === '1.0') {
    // v1 逻辑
  } else if (version === '2.0') {
    // v2 逻辑
  } else {
    res.status(400).json({error: 'Unsupported API version'});
  }
});
```

## API 文档生成

### 使用 Swagger

```javascript
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Huxy Node Server API',
      version: '1.0.0',
      description: 'API documentation for Huxy Node Server',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

const {app} = await startServer({
  port: 3000,
}, (config, app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
});
```

### Swagger 注解示例

```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
app.get('/api/users', (req, res) => {
  res.json([{id: 1, name: 'John Doe'}]);
});
```

### 使用 OpenAPI

```javascript
import {serve, setup} from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerDocument = YAML.load('./openapi.yaml');

const {app} = await startServer({
  port: 3000,
}, (config, app) => {
  app.use('/api-docs', serve, setup(swaggerDocument));
});
```

## 最佳实践

### API 设计原则

1. **RESTful 设计**: 遵循 REST 原则
2. **一致的命名**: 使用名词复数形式
3. **一致的响应格式**: 所有端点返回相同的结构
4. **适当的 HTTP 状态码**: 使用正确的状态码
5. **分页**: 对列表端点支持分页
6. **过滤和排序**: 支持查询参数
7. **速率限制**: 保护 API 不被滥用
8. **版本控制**: 计划 API 版本控制

### 安全最佳实践

1. **使用 HTTPS**: 总是使用 HTTPS
2. **输入验证**: 验证所有输入
3. **身份验证**: 实现适当的身份验证
4. **授权**: 实现基于角色的访问控制
5. **速率限制**: 防止暴力攻击
6. **安全头**: 使用 Helmet
7. **CORS**: 配置适当的 CORS 策略
8. **日志**: 记录所有请求和错误

### 性能最佳实践

1. **缓存**: 实现适当的缓存
2. **压缩**: 启用响应压缩
3. **数据库优化**: 优化查询
4. **连接池**: 使用数据库连接池
5. **异步处理**: 使用异步操作
6. **负载均衡**: 对高流量 API 使用负载均衡
7. **监控**: 监控 API 性能
8. **限流**: 实现请求限流