# 🎋 小红书跳转卡片管理系统 
小红书跳转卡片管理系统
核心功能
1. 用户管理系统
-用户注册/登录 - JWT认证，密码加密

-用户等级系统 - 4个会员等级（普通/银牌/金牌/钻石）

-积分系统 - 创建卡片消耗积分

-用户短ID - 专属转赠操作标识

2. 卡片管理系统
-生僻字卡密生成 - 汉字组合的唯一卡密

-卡片创建 - 根据会员等级限制创建

-卡片分享 - 分享获得积分奖励

-卡片验证 - Hook API自动验证格式

3. 会员等级权益
-等级	名称	卡片成本		特权功能

-1级	普通会员	100积分		基础卡片创建

-2级	银牌会员	30积分		+高级模板

-3级	金牌会员	20积分		+批量操作

-4级	钻石会员	10积分		+优先支持

-4.  API系统
-调用接口 - 专门为移动端设计

-自动验证 - 验证卡密格式和有效性

5. 安全与管理
-访问限流 - 防止API滥用

-用户状态管理 - 活跃/禁用/封禁状态

-登录失败保护 - 防暴力破解

-管理员后台 - 用户和系统管理

6. 技术架构
-后端: Node.js + Express

-数据库: MySQL + Sequelize ORM

-认证: JWT Token

-邮件: NodeMailer

-部署: PM2 + Nginx

-日志: Winston

7. API接口
-用户认证: 注册/登录/token验证

-卡片管理: CRUD操作

-管理后台: 用户管理

-健康检查: 系统状态监控

🎮 使用场景
-这套系统主要用于：

-小红书跳转卡片制作 - 通过卡片形式内置跳转链接



### 环境要求
- **Node.js**: 16.0+ 
- **MySQL**: 5.7+ 或 8.0
- **PM2**: 进程管理器
- **Nginx**: Web服务器 (推荐)

### 部署步骤

#### 1. 上传项目文件
```bash
# 上传到服务器目录
/var/www/
```

#### 2. 配置环境变量
```bash
# 复制并编辑配置文件
cp env.production .env
nano .env

# 修改关键配置:
# - DB_PASSWORD: 数据库密码
# - JWT_SECRET: JWT密钥 (256位)
# - APP_URL: 您的域名
# - CORS_ORIGIN: 允许的域名
```

#### 3. 初始化数据库
```bash
# 创建数据库和用户
mysql -u root -p < setup-database.sql

# 或手动创建:
CREATE 
CREATE 
GRANT 
FLUSH 
```

#### 4. 启动应用
```bash
# 运行生产启动脚本
chmod +x start-production.sh
./start-production.sh

# 或手动启动:
npm install --production
pm2 start ecosystem.config.js --env production
```

### 🌐 Nginx配置

#### 复制Nginx配置
```bash
# 复制配置文件
cp nginx.conf /etc/nginx/sites-available/
ln -s /etc/nginx/sites-available/*****/etc/nginx/sites-enabled/

# 修改域名
sed -i 's/your-domain.com/yourdomain.com/g' /etc/nginx/sites-enabled/

# 测试并重启Nginx
nginx -t
systemctl restart nginx
```

## 📍 生产环境地址

- **网站**: https://yourdomain.com
- **API健康检查**: https://yourdomain.com/api/health  
- **Hook API**: https://yourdomain.com/api/hook/getcard

## 🎯 核心功能

### 生僻字卡密系统
- **格式**: 汉字组合 
- **生成**: 自动生成唯一卡密
- **验证**: Hook API自动验证格式

### Hook API (Android调用)
```bash
# 接口地址
POST 

# 请求参数
{
  "cardKey": 
  "receiverId": 
}

# 响应格式
{
  "success": true,
  "message": "卡片发送成功",
  "data": {...}
}
```

## 📁 生产环境结构

```
/var/www/html/app/
├── server.js              # 主服务器
├── package.json           # 依赖配置
├── .env                   # 环境配置 (重要!)
├── ecosystem.config.js    # PM2配置
├── nginx.conf             # Nginx配置
├── start-production.sh    # 启动脚本
├── setup-database.sql     # 数据库初始化
├── config/                # 应用配置
├── middleware/            # 中间件
├── models/                # 数据模型
├── routes/                # API路由
├── public/                # 前端文件
├── logs/                  # 日志文件
```

## 🔧 管理命令

### PM2进程管理
```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs xiaohongshu-card-app

# 重启应用
pm2 restart xiaohongshu-card-app

# 停止应用
pm2 stop xiaohongshu-card-app

# 删除应用
pm2 delete xiaohongshu-card-app
```

### 数据库管理
```bash
# 连接数据库
mysql -u your_database_user -p your_database_name

# 备份数据库
mysqldump -u your_database_user -p your_database_name > backup.sql

# 恢复数据库
mysql -u your_database_user -p your_database_name < backup.sql
```

### 日志管理
```bash
# 查看应用日志
tail -f logs/combined.log

# 查看错误日志
tail -f logs/error.log

# 清理旧日志
find logs/ -name "*.log" -mtime +30 -delete
```

## 🔒 SSL证书配置

### 使用Let's Encrypt (推荐)
```bash
# 安装Certbot
apt install certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 手动配置SSL
1. 上传证书文件到服务器
2. 修改Nginx配置中的证书路径
3. 启用HTTPS重定向

## 🧪 生产环境测试

### API接口测试
```bash
# 健康检查
curl https://yourdomain.com/api/health

# Hook API测试
curl -X POST https://yourdomain.com/api/hook/getcard \
  -H "Content-Type: application/json" \
  -d '{"cardKey":"测试卡密系","receiverId":"test"}'
```

### 性能测试
```bash
# 安装测试工具
npm install -g loadtest

# 压力测试
loadtest -n 1000 -c 10 https://yourdomain.com/api/health
```

## 🚨 故障排查

### 应用无法启动
1. 检查.env配置文件
2. 验证数据库连接
3. 查看PM2日志: `pm2 logs`
4. 检查端口占用: `netstat -tlnp | grep 3000`

### 数据库连接失败
1. 确认MySQL服务运行: `systemctl status mysql`
2. 测试数据库连接: `mysql -u your_database_user -p`
3. 检查防火墙配置
4. 验证数据库权限

### Nginx配置问题
1. 测试配置语法: `nginx -t`
2. 查看错误日志: `tail -f /var/log/nginx/error.log`
3. 检查域名解析
4. 验证SSL证书有效性

## ✅ 生产环境清单

- [ ] ✅ Node.js 16+ 已安装
- [ ] ✅ MySQL 数据库已配置
- [ ] ✅ PM2 进程管理器已安装
- [ ] ✅ Nginx Web服务器已配置
- [ ] ✅ .env 环境变量已设置
- [ ] ✅ 数据库已初始化
- [ ] ✅ SSL证书已配置
- [ ] ✅ 防火墙端口已开放
- [ ] ✅ 域名DNS已解析
- [ ] ✅ 应用正常启动
- [ ] ✅ API接口测试通过

---

**🎉 生产环境部署完成，系统已就绪！**

## 📞 技术支持

- 查看日志文件排查问题
- 检查PM2进程状态
- 验证Nginx配置正确性
- 确认数据库连接正常
- <img width="1664" height="842" alt="image" src="https://github.com/user-attachments/assets/55af7fa6-11e3-46b7-861d-b6a93a75fbf3" />
- <img width="1679" height="960" alt="image" src="https://github.com/user-attachments/assets/dd0680c5-2a26-403b-a129-043b600b3661" />
- <img width="1653" height="836" alt="image" src="https://github.com/user-attachments/assets/a3601be9-89b0-4142-b3af-29b4f36df044" />



- 实际部署：hongshuka.site
- 账号：123456
- 密码：123456
-   ![一点科技微信码](https://github.com/user-attachments/assets/33e86168-89da-4e29-a52c-1f405b9a718f)

