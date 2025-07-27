const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// 添加未捕获异常处理，防止进程崩溃
process.on('uncaughtException', (error) => {
  console.error('💥 未捕获异常:', error);
  console.error('错误堆栈:', error.stack);
  // 不立即退出，记录错误后继续运行
  console.error('⚠️  应用将继续运行，但建议检查错误原因');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 未处理的Promise拒绝:', reason);
  console.error('Promise:', promise);
  // 不立即退出，记录错误后继续运行
  console.error('⚠️  应用将继续运行，但建议检查错误原因');
});

// 导入数据库配置
const { testConnection, syncDatabase } = require('./config/database');

// 导入模型关联配置
require('./models');

// 导入路由
const authRoutes = require('./routes/auth');
const cardRoutes = require('./routes/cards');
const hookRoutes = require('./routes/hook');
const adminRoutes = require('./routes/admin');
const userActionsRoutes = require('./routes/userActions');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// 信任反向代理 (Nginx)
app.set('trust proxy', 1);

// 安全中间件 - 临时禁用
/*
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
*/

// CORS配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || false,
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 生产环境限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: '请求过于频繁，请稍后再试',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true, // 启用ETag有助于缓存验证
  setHeaders: function (res, filePath) {
    // 对HTML文件禁用缓存，确保前端更改能立即生效
    if (path.extname(filePath) === '.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Hook健康检查 (专门给Android使用)
app.get('/api/hook/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/hook', hookRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userActionsRoutes);

// 根路径返回前端页面
app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '请求的资源不存在',
    code: 'NOT_FOUND',
    path: req.originalUrl
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  // 记录错误（生产环境应使用专业日志系统）
  if (process.env.NODE_ENV === 'production') {
    console.error(`[${new Date().toISOString()}] ERROR:`, err.message);
  } else {
    console.error('服务器错误:', err);
  }

  // 不暴露敏感信息
  const message = process.env.NODE_ENV === 'production'
    ? '服务器内部错误'
    : err.message;

  res.status(err.status || 500).json({
    error: message,
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 数据库连接
    let dbConnected = false;
    
    try {
      dbConnected = await testConnection();
      if (dbConnected) {
        await syncDatabase();
        console.log('✅ 数据库连接成功');
      }
    } catch (dbError) {
      console.warn('⚠️  数据库连接失败，将以离线模式运行:', dbError.message);
      dbConnected = false;
    }

    // 启动HTTP服务器 - 无论数据库是否连接都启动
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 小红书卡片系统启动成功!`);
      console.log(`📍 服务地址: http://${HOST}:${PORT}`);
      console.log(`🎯 运行环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔐 安全配置: ${process.env.JWT_SECRET ? '已启用' : '使用默认'}`);
      console.log(`💾 数据库: ${dbConnected ? '已连接' : '离线模式'}`);
      console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
      
      if (!dbConnected) {
        console.log(`⚠️  注意：数据库未连接，部分功能可能不可用`);
        console.log(`🔧 请检查数据库配置：`);
        console.log(`   - DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   - DB_PORT: ${process.env.DB_PORT || 3306}`);
        console.log(`   - DB_NAME: ${process.env.DB_NAME || 'your_database_name'}`);
        console.log(`   - DB_USER: ${process.env.DB_USER || 'your_database_user'}`);
      }
    });

    // 优雅关闭处理
    const gracefulShutdown = (signal) => {
      console.log(`\n📴 接收到 ${signal} 信号，开始优雅关闭...`);
      server.close(() => {
        console.log('✅ HTTP服务器已关闭');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ 服务器启动失败:', error.message);
    console.error('错误详情:', error.stack);
    // 修改：不立即退出，而是等待一段时间后再退出，给PM2时间记录日志
    setTimeout(() => {
      console.error('💥 服务器启动失败，进程将退出');
      process.exit(1);
    }, 5000); // 等待5秒
  }
};

// 启动应用
startServer();

module.exports = app;