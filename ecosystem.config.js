module.exports = {
  apps: [
    {
      name: 'xiaohongshu-card-app',
      script: 'server.js',
      instances: 1, // 单实例模式，避免集群复杂性
      exec_mode: 'fork', // fork模式更稳定
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // 内存和重启配置
      max_memory_restart: '1G',
      min_uptime: '60s',
      max_restarts: 3,
      restart_delay: 10000
      
      // 日志配置
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // 监控配置
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads', 'temp'],
      
      // 自动重启配置
      autorestart: true,
      node_args: '--max_old_space_size=1024',
      
      // 错误处理配置
      exp_backoff_restart_delay: 1000,
      max_memory_restart: '800M',
      
      // 健康检查
      kill_timeout: 10000, // 增加kill超时时间
      listen_timeout: 10000, // 增加监听超时时间
      
      // 环境变量
      env_file: '.env',
      
      // 新增：更稳定的配置
      wait_ready: true, // 等待应用准备就绪
      listen_timeout: 10000, // 监听超时
      kill_timeout: 10000, // 终止超时
      
      // 新增：错误处理策略
      stop_exit_codes: [0], // 只有退出码为0时才认为是正常停止
      
      // 新增：实例管理
      instance_var: 'INSTANCE_ID',
      
      // 新增：日志轮转
      log_type: 'json',
      
      // 新增：监控配置
      pmx: false, // 禁用PMX监控以减少开销
      
      // 新增：时间配置
      time: true // 在日志中显示时间戳
    }
  ],
  
  // 部署配置模板 - 生产环境请根据实际情况配置
  deploy: {
    production: {
      user: 'deploy_user',
      host: 'production-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:username/repository-name.git',
      path: '/var/www/html/app',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci --production && pm2 reload ecosystem.config.js --env production && pm2 save',
      'pre-setup': ''
    }
  }
}; 