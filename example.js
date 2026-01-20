import {startServer, startStatic, createLogger, dateTime} from './src/index.js';

const testLogger = await createLogger()('test');

testLogger.info({x: 123}, dateTime());
testLogger.error({status: 400}, '测试');

// startServer
const {app, config, httpServer} = await startServer({
  port: 8080,
  host: 'localhost',
  appName: '测试Demo',
  // ...
}, (config, app, httpServer, logger) => {
  app.get('/config', (req, res) => {
    logger.info(config, '详细配置：');
    res.status(200).json({ 
      result: config,
    });
  });
  app.use('/', (req, res) => {
    logger.info({url: req.url}, 'url');
    // logger.info(req.headers, 'headers');
    // logger.info(req.body, 'body');
  });
});

// startStatic
const huxyServer = await startStatic({
  port: 9000,
  basepath: '/',
  buildPath: './build',
  logger: console,
  // ssl: {
  //   key: '/path/to/name.key',
  //   cert: '/path/to/name.pem',
  // },
}, (config, app, httpServer, logger) => {
  logger.info(config);
});


// 启动服务可加参数如：node example.js port=8080 或 PORT=8080 node example.js
