const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const winston = require('winston');
const config = require('../config/app.config');

// 配置日志器
const logger = winston.createLogger({
  level: config.log.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'xhscard-system' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// 如果不是生产环境，也输出到控制台
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// 基础限流器
const basicLimiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.max,
  message: {
    success: false,
    message: config.security.rateLimit.message
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 严格限流器（用于敏感操作）
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多5次请求
  message: {
    success: false,
    message: '敏感操作过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 登录限流器
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 最多10次登录尝试
  message: {
    success: false,
    message: '登录尝试过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 注册限流器
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 3, // 最多3次注册
  message: {
    success: false,
    message: '注册过于频繁，请1小时后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 正常限流器（别名）
const normalRateLimit = basicLimiter;

// 安全头部设置
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// IP白名单检查（可选）
const checkIPWhitelist = (req, res, next) => {
  const whitelist = process.env.IP_WHITELIST ? process.env.IP_WHITELIST.split(',') : [];
  
  if (whitelist.length === 0) {
    return next(); // 如果没有设置白名单，则跳过检查
  }

  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  if (whitelist.includes(clientIP)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'IP地址不在白名单中'
    });
  }
};

// API密钥验证（用于Hook模块）
const validateAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apikey;
  const validKey = process.env.API_KEY || 'default-api-key';

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: '缺少API密钥'
    });
  }

  if (apiKey !== validKey) {
    return res.status(403).json({
      success: false,
      message: 'API密钥无效'
    });
  }

  next();
};

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = {
  logger,
  basicLimiter,
  strictLimiter,
  strictRateLimit: strictLimiter,
  loginLimiter,
  registerLimiter,
  normalRateLimit,
  securityHeaders,
  checkIPWhitelist,
  validateAPIKey,
  requestLogger
}; 