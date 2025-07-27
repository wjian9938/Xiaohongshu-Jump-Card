const { DataTypes, Op } = require('sequelize');
// 移除独立的、错误的sequelize实例，所有模型都应使用由models/index.js传入的实例
// const { sequelize } = require('../config/database'); 
const bcrypt = require('bcryptjs');
const config = require('../config/app.config');

// 用户模型 - Sequelize版本
// 将 sequelize.define 改为 (sequelize, DataTypes) => { ... } 的导出函数格式
module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        len: [3, 30],
        is: /^[a-zA-Z0-9_]+$/
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    nickname: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        len: [1, 20]
      }
    },
    shortId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Will be generated after creation
      comment: '用户的专属短ID，用于转赠等操作'
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    membershipLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 4
      }
    },
    totalSpent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    totalEarned: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    cardsCreated: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'banned', 'pending'),
      defaultValue: 'active'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lockUntil: {
      type: DataTypes.DATE
    },
    inviteCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '注册时使用的邀请码'
    },
    loginCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // 新增：微信OpenID字段
    openid: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '微信OpenID'
    },
    // 新增：小红书用户ID字段
    xhsUserId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '小红书用户ID'
    },
    // 新增：最后升级检查时间
    lastUpgradeCheck: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后升级检查时间'
    }
  }, {
    tableName: 'users',
    indexes: [
      { fields: ['username'], unique: true },
      { fields: ['email'], unique: true },
      { fields: ['shortId'], unique: true, where: { shortId: { [Op.ne]: null } } },
      { fields: ['membershipLevel'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
      { fields: ['points'] },
      // 新增：微信OpenID索引
      { fields: ['openid'], unique: true, where: { openid: { [Op.ne]: null } } },
      // 新增：小红书用户ID索引
      { fields: ['xhsUserId'], where: { xhsUserId: { [Op.ne]: null } } }
    ],
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(config.security.bcrypt.rounds);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // 实例方法
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.getMembershipInfo = function() {
    return config.membership.levels[this.membershipLevel] || config.membership.levels[1];
  };

  User.prototype.checkAndUpgrade = function() {
    const thresholds = config.membership.upgradeThresholds;
    let newLevel = this.membershipLevel;
    
    for (const level in thresholds) {
      if (this.points >= thresholds[level] && parseInt(level) > newLevel) {
        newLevel = parseInt(level);
      }
    }
    
    if (newLevel !== this.membershipLevel) {
      this.membershipLevel = newLevel;
      this.lastUpgradeCheck = new Date();
      return true;
    }
    return false;
  };

  User.prototype.toSafeObject = function() {
    const user = this.toJSON();
    delete user.password;
    delete user.loginAttempts;
    delete user.lockUntil;
    return user;
  };

  // 静态方法
  User.validateInviteCode = function(code) {
    const validCodes = (process.env.DEFAULT_INVITE_CODES || 'XHS2024,CARD888,VIP2024').split(',');
    return validCodes.includes(code);
  };

  User.getCardCreateCost = function(membershipLevel) {
    return config.membership.levels[membershipLevel]?.cardCost || 100;
  };

  return User;
}; 