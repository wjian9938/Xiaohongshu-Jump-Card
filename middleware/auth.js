const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT认证中间件
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: '未提供认证令牌',
        code: 'NO_TOKEN'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
    
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(decoded.userId);

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        error: '用户不存在或已被禁用',
        code: 'USER_INVALID'
      });
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    console.error('认证失败:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token已过期',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        error: 'Token无效',
        code: 'TOKEN_INVALID'
      });
    } else {
      return res.status(500).json({
        error: '认证服务异常',
        code: 'AUTH_ERROR'
      });
    }
  }
};

// 管理员权限检查中间件
const requireAdmin = (req, res, next) => {
  // 此中间件必须在 authenticateToken 之后使用
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      error: '需要管理员权限',
      code: 'ADMIN_REQUIRED'
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin
}; 