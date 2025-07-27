module.exports = {
  apps: [
    {
      name: 'card',
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
      // 生产环境配置
      max_memory_restart: '1G',
      min_uptime: '60s', // 增加最小运行时间到60秒
      max_restarts: 3, // 进一步减少最大重启次数
      restart_delay: 10000, // 增加重启延迟到10秒
      
      // 日志配置
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // 监控配置
      watch: false, // 生产环境不开启文件监控
      ignore_watch: ['node_modules', 'logs', 'uploads', 'temp'],
      
      // 自动重启配置
      autorestart: true,
      node_args: '--max_old_space_size=1024',
      
      // 错误处理 - 更宽松的设置
      exp_backoff_restart_delay: 1000, // 指数退避重启延迟
      max_memory_restart: '800M', // 内存限制
      
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
  
  // 部署配置 (宝塔面板)
  deploy: {
    production: {
      user: 'your_server_user',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/your-repo.git',
      path: '/path/to/your/app',
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js --env production'
    }
  }
}; 