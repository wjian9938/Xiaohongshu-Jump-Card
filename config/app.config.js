require('dotenv').config({ path: './.env' });

const config = {
  // 应用基本配置
  app: {
    name: '小红书卡片系统',
    version: '2.0.0',
    port: process.env.APP_PORT || 3001,
    env: process.env.NODE_ENV || 'production'
  },

  // 数据库配置 - 统一使用MySQL，修改默认值匹配现有数据库
  database: {
    mysql: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || 'your_database_name',
      username: process.env.DB_USER || 'your_database_user',
      password: process.env.DB_PASSWORD || 'your_database_password'
    }
  },

  // 安全配置 - 统一JWT配置
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
      expiresIn: process.env.JWT_EXPIRE || '7d'
    },
    bcrypt: {
      rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100, // 最多100次请求
      message: '请求过于频繁，请稍后再试'
    }
  },

  // 会员等级配置
  membership: {
    levels: {
      1: {
        name: '普通会员',
        cardCost: 100,
        dailyCards: 10,
        features: ['基础卡片创建']
      },
      2: {
        name: '银牌会员',
        cardCost: 30,
        dailyCards: 25,
        features: ['基础卡片创建', '高级模板']
      },
      3: {
        name: '金牌会员',
        cardCost: 20,
        dailyCards: 50,
        features: ['基础卡片创建', '高级模板', '批量操作']
      },
      4: {
        name: '钻石会员',
        cardCost: 10,
        dailyCards: 100,
        features: ['基础卡片创建', '高级模板', '批量操作', '优先支持']
      }
    },
    upgradeThresholds: {
      2: 1000,   // 银牌会员需要1000积分
      3: 5000,   // 金牌会员需要5000积分
      4: 10000   // 钻石会员需要10000积分
    }
  },

  // 积分系统
  points: {
    actions: {
      register: parseInt(process.env.DEFAULT_POINTS) || 1000,
      login: 10,
      createCard: -100,
      shareCard: 50,
      inviteFriend: 500
    }
  },

  // 邮件配置
  email: {
    host: process.env.EMAIL_HOST || 'smtp.qq.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  },

  // API配置
  api: {
    version: 'v1',
    prefix: '/api',
    timeout: 30000,
    key: process.env.API_KEY || 'your-api-key-here'
  },

  // 文件上传配置
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    uploadDir: './public/uploads'
  },

  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxFiles: 5,
    maxSize: '10m'
  },

  // 微信配置 (可选)
  wechat: {
    appid: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || ''
  }
};

module.exports = config; 