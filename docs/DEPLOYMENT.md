# 部署指南

本指南提供了将 Huxy Node Server 部署到不同环境的详细说明。

## 目录

- [本地开发](#本地开发)
- [生产环境准备](#生产环境准备)
- [Docker 部署](#docker-部署)
- [云服务器部署](#云服务器部署)
- [PM2 进程管理](#pm2-进程管理)
- [Nginx 反向代理](#nginx-反向代理)
- [HTTPS 配置](#https-配置)
- [负载均衡](#负载均衡)
- [监控和日志](#监控和日志)
- [CI/CD 集成](#cicd-集成)

## 本地开发

### 前提条件

- Node.js 20.0.0 或更高版本
- npm、yarn 或 pnpm

### 安装和运行

```bash
# 克隆仓库
git clone https://github.com/ahyiru/huxy-node-server.git
cd huxy-node-server

# 安装依赖
npm install

# 复制环境变量示例
cp .env.example .env

# 修改 .env 文件根据需要配置

# 启动开发服务器（自动重载）
npm run dev
```

### 开发工具

- **VS Code**: 推荐使用，具有良好的 JavaScript/Node.js 支持
- **ESLint**: 内置代码风格检查
- **Prettier**: 代码格式化（可选）

## 生产环境准备

### 检查清单

1. **环境变量**:
   - 设置 `NODE_ENV=production`
   - 配置适当的 CORS 策略
   - 设置速率限制
   - 配置日志级别

2. **安全**:
   - 使用强密码和秘钥
   - 禁用调试端点
   - 设置适当的 CORS 限制
   - 启用 Helmet 安全头

3. **性能**:
   - 启用压缩
   - 配置缓存策略
   - 优化数据库查询

4. **监控**:
   - 设置日志轮换
   - 配置健康检查
   - 设置告警

### 生产环境变量示例

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
CORS_ORIGIN=https://yourdomain.com,https://yourapp.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=30
```

## Docker 部署

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# 使用多阶段构建减小镜像大小
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

### 构建和运行

```bash
# 构建 Docker 镜像
docker build -t huxy-node-server:latest .

# 运行容器
docker run -d \
  --name huxy-server \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e CORS_ORIGIN=https://yourdomain.com \
  --restart unless-stopped \
  huxy-node-server:latest
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      CORS_ORIGIN: https://yourdomain.com
      RATE_LIMIT_WINDOW_MS: 900000
      RATE_LIMIT_MAX_REQUESTS: 1000
      LOG_LEVEL: 30
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 云服务器部署

### AWS EC2

```bash
# 连接到 EC2 实例
ssh -i your-key.pem ec2-user@your-ec2-ip

# 安装 Node.js
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 克隆仓库
git clone https://github.com/ahyiru/huxy-node-server.git
cd huxy-node-server

# 安装依赖
npm install --production

# 创建 .env 文件
nano .env

# 使用 PM2 运行
npm install -g pm2
pm2 start src/index.js --name "huxy-server"
```

### Google Cloud / Azure

类似于 AWS EC2，但使用各自的 VM 实例和连接方法。

## PM2 进程管理

### 安装 PM2

```bash
npm install -g pm2
```

### 基本命令

```bash
# 启动应用
pm2 start src/index.js --name "huxy-server"

# 列出所有进程
pm2 list

# 监控进程
pm2 monit

# 查看日志
pm2 logs

# 重启应用
pm2 restart huxy-server

# 停止应用
pm2 stop huxy-server

# 删除应用
pm2 delete huxy-server
```

### PM2 配置文件

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'huxy-server',
    script: 'src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      CORS_ORIGIN: 'https://yourdomain.com',
    },
    max_memory_restart: '1G',
    watch: false,
    merge_logs: true,
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
  }],
};
```

然后运行：

```bash
pm2 start ecosystem.config.js
```

## Nginx 反向代理

### 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx
```

### Nginx 配置

创建 `/etc/nginx/conf.d/huxy-server.conf`：

```nginx
upstream huxy_server {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://huxy_server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        proxy_pass http://huxy_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 健康检查
    location /health {
        proxy_pass http://huxy_server/health;
        proxy_set_header Host $host;
    }

    # 错误页面
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### 重启 Nginx

```bash
sudo nginx -t  # 测试配置
sudo systemctl restart nginx
```

## HTTPS 配置

### 使用 Let's Encrypt

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

### Nginx HTTPS 配置

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # 其余配置与 HTTP 相同...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

## 负载均衡

### 多实例部署

```bash
# 使用 PM2 启动多实例
pm2 start src/index.js -i max --name "huxy-server"
```

### Nginx 负载均衡

```nginx
upstream huxy_cluster {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    
    # 负载均衡算法
    # least_conn;  # 最少连接
    # ip_hash;     # IP 哈希（会话保持）
    # hash $request_uri consistent;  # URI 哈希
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://huxy_cluster;
        # 其余代理配置...
    }
}
```

## 监控和日志

### 日志管理

```bash
# 查看实时日志
pm2 logs

# 使用 pm2-logrotate 管理日志
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 10
pm2 set pm2-logrotate:compress true
```

### 监控工具

- **Prometheus + Grafana**: 监控指标和可视化
- **ELK Stack**: 日志收集和分析
- **Sentry**: 错误跟踪
- **New Relic**: 应用性能监控

### 健康检查

服务器提供内置健康检查端点：

```bash
curl http://localhost:3000/health
```

可以集成到 Kubernetes、Docker Swarm 或其他编排系统中。

## CI/CD 集成

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20'

    - name: Install dependencies
      run: npm install --production

    - name: Build
      run: npm run build

    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SSH_HOST }}
        username: ${{ secrets.SSH_USERNAME }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /path/to/huxy-server
          git pull origin main
          npm install --production
          pm2 restart huxy-server
```

### GitLab CI 示例

```yaml
stages:
  - deploy

deploy_production:
  stage: deploy
  only:
    - main
  script:
    - npm install --production
    - pm2 restart huxy-server
  environment:
    name: production
    url: https://yourdomain.com
```

## 故障排除

### 常见问题

1. **端口被占用**:
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

2. **内存泄漏**:
   ```bash
   pm2 monit
   # 或使用 Chrome DevTools
   node --inspect src/index.js
   ```

3. **数据库连接问题**:
   - 检查防火墙设置
   - 验证连接字符串
   - 检查数据库是否运行

4. **CORS 错误**:
   - 检查 CORS_ORIGIN 配置
   - 确保前端和后端域名匹配

### 调试技巧

```bash
# 启用调试日志
LOG_LEVEL=10 npm start

# 使用 Node.js 调试器
node --inspect src/index.js

# 检查端口
netstat -tuln | grep 3000

# 检查进程
ps aux | grep node
```

## 更新和维护

### 更新服务器

```bash
# 更新代码
git pull origin main

# 更新依赖
npm update

# 重启服务
pm2 restart huxy-server
```

### 定期维护

1. **依赖更新**: 每月检查并更新依赖
2. **安全审计**: 使用 `npm audit` 检查漏洞
3. **日志轮换**: 定期清理旧日志
4. **备份**: 定期备份配置和数据

## 最佳实践

1. **零停机部署**: 使用蓝绿部署或滚动更新
2. **回滚计划**: 准备快速回滚策略
3. **监控告警**: 设置关键指标告警
4. **定期测试**: 定期进行负载测试和安全测试
5. **文档更新**: 保持部署文档与代码同步