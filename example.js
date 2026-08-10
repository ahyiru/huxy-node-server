import {startServer, startStatic} from './src/index.js';

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
const huxyServer = await startStatic({
  port: 9000,
  basepath: '/',
  // logger: console,
  // ssl: {
  //   key: '/path/to/name.key',
  //   cert: '/path/to/name.pem',
  // },
  buildPath: './build',
  // basic auth
  basicAuth: {
    users: {
      admin: '123456',
    },
  },
}, (config, app, httpServer, logger) => {
  logger.info(config);
});

// 启动服务可加参数如：node example.js port=8080 或 PORT=8080 node example.js

