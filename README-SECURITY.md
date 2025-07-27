# 安全配置指南

## 开源前的安全清理已完成

此项目已经过安全清理，所有敏感信息已被移除：

### 已清理的敏感信息
- ✅ 数据库账号密码（替换为占位符）
- ✅ JWT密钥（替换为占位符）
- ✅ API密钥（替换为占位符）
- ✅ 服务器域名信息（替换为示例）
- ✅ 生产环境配置（替换为模板）
- ✅ 用户上传文件（已删除）
- ✅ 日志文件（已删除）

### 部署前必须配置

1. **复制环境变量模板**
   ```bash
   cp .env.template .env
   ```

2. **修改 `.env` 文件，填入真实配置：**
   - `DB_NAME`: 你的数据库名
   - `DB_USER`: 你的数据库用户名
   - `DB_PASSWORD`: 你的数据库密码
   - `JWT_SECRET`: 强密码（至少32位）
   - `API_KEY`: API访问密钥

3. **生成强密码示例：**
   ```bash
   # JWT密钥
   openssl rand -base64 32
   
   # API密钥
   openssl rand -hex 32
   ```

### 安全提醒

- 🔒 `.env` 文件已加入 `.gitignore`，不会被提交
- 🔒 `logs/` 目录已加入 `.gitignore`
- 🔒 `public/uploads/` 目录已加入 `.gitignore`
- ⚠️ 生产环境请务必使用HTTPS
- ⚠️ 定期更换密钥和密码

### 数据库初始化

1. 修改 `setup-database.sql` 中的占位符
2. 执行数据库初始化脚本

```sql
-- 将 your_database_name 替换为实际数据库名
-- 将 your_database_user 替换为实际用户名
-- 将 your_database_password 替换为实际密码
``` 