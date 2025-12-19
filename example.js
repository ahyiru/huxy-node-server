import {startServer, startStatic, logger, createLogger, dateTime} from './src/index.js';

logger.info(dateTime());

const testLogger = createLogger('test');

testLogger.info({x: 123}, '测试');
logger.error({status: 400}, 'HTTP请求错误');

// startServer
const {app, config, httpServer} = await startServer({
  port: 8080,
  host: 'localhost',
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
  buildPath: './build',
}, (config, app) => {
  logger.info(config);
});


// 启动服务可加参数如：node example.js port=8080 或 PORT=8080 node example.js
