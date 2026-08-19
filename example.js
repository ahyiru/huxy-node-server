import {startServer, startStatic, basicAuth, codeAuth} from './src/index.js';

process.env.NODE_ENV = 'development';

// startServer
const {app, config, httpServer, logger} = await startServer({
  port: 8080,
  host: 'localhost',
  appName: '测试Demo',
  apiPrefix: '/',
  // proxyConfig
  proxys: [{
    name: 'ollama',
    target: 'http://192.168.0.111:11434',
    withPrefix: false,
  }],
  // apiKey
  // authToken: 'apikey',
  // jwtConfig
  /*jwtConfig: {
    secret: '',
    expiresIn: '',
    algorithm: '',
    issuer: '',
  },*/
  // ...
}, (config, app, httpServer, logger) => {
  app.get('/config', (req, res) => {
    logger.info('详细配置：', config);
    res.status(200).json({ 
      result: config,
    });
  });
});

// startStatic
const codeAuthCfg = {
  session: {
    secret: 'auth-secret',
    maxAge: 30,
  },
  code: {
    ttl: 300000,
    len: 6,
    maxAttempts: 5,
  },
  mail: {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {/*mail 配置*/},
    from: 'XX <xxx@gmail.com>',
    subject: 'XX 访问验证码',
  },
  allowedEmails: ['xxx@gmail.com'],
  page: {
    title: 'XX 团队',
    tips: '请使用 XX 团队电子邮件登录！',
    footer: '仅供 XX 团队使用。',
  },
};
const basicAuthCfg = {
  users: {
    admin: '123456',
  },
};
const huxyServer = await startStatic({
  port: 9000,
  basepath: '/',
  // logger: console,
  // ssl: {
  //   key: '/path/to/name.key',
  //   cert: '/path/to/name.pem',
  // },
  buildPath: './build',
}, async (config, app, httpServer, logger) => {
  await basicAuth(basicAuthCfg, app);
  codeAuth(codeAuthCfg, app);
});

// 启动服务可加参数如：node example.js port=8080 或 PORT=8080 node example.js

