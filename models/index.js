const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

const db = {};

db.User = require('./User')(sequelize, DataTypes);
db.Card = require('./Card')(sequelize, DataTypes);

// 定义模型关系
// 一个用户 (User) 可以创建多个卡片 (Card)
db.User.hasMany(db.Card, {
  foreignKey: 'userId',
  as: 'cards', // 在查询用户时，可以用 'cards' 别名来包含他创建的所有卡片
  onDelete: 'CASCADE' // 如果用户被删除，其关联的卡片也应被删除
});

// 一个卡片 (Card) 只属于一个创建者 (User)
db.Card.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'creator' // 在查询卡片时，可以用 'creator' 别名来包含创建者信息
});

db.sequelize = sequelize;
db.Sequelize = require('sequelize');

module.exports = db;