#!/bin/bash

# 🚀 小红书卡片系统 - 生产环境启动脚本

echo "🚀 启动小红书卡片系统..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装Node.js 16+版本"
    exit 1
fi

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装PM2进程管理器..."
    npm install -g pm2
fi

# 检查环境配置文件
if [ ! -f ".env" ]; then
    echo "⚠️  .env文件不存在，请根据env.example创建..."
    echo "   cp env.example .env"
    echo "   nano .env  # 编辑配置信息"
    exit 1
fi

# 创建必要目录
mkdir -p logs
mkdir -p uploads
mkdir -p temp

# 设置权限
chmod -R 755 logs uploads temp

# 安装依赖
echo "📦 安装NPM依赖..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

# 数据库初始化提醒
echo "💾 数据库配置检查..."
echo "   请确保已执行: mysql -u root -p < setup-database.sql"

# 启动应用
echo "🚀 启动应用服务..."

# 使用PM2启动
pm2 start ecosystem.config.js --env production

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 小红书卡片系统启动成功！"
    echo ""
    echo "📋 管理命令:"
    echo "   查看状态: pm2 status"
    echo "   查看日志: pm2 logs hongshuka-card"
    echo "   重启应用: pm2 restart hongshuka-card"
    echo "   停止应用: pm2 stop hongshuka-card"
    echo ""
    echo "🌐 访问地址:"
    echo "   网站: http://localhost:3000"
    echo "   API: http://localhost:3000/api/health"
    echo ""
else
    echo "❌ 应用启动失败，请检查配置"
    exit 1
fi 