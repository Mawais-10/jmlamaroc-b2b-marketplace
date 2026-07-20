// PM2 Ecosystem Configuration for VPS Deployment
// Usage: pm2 start ecosystem.config.js
// Stop:  pm2 stop all
// Logs:  pm2 logs

module.exports = {
  apps: [
    {
      name: 'choufliya-backend',
      cwd: './server',
      script: 'index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      merge_logs: true,
    },
    {
      name: 'telegram-service',
      cwd: './telegram-service',
      script: 'app.py',
      interpreter: 'python3',
      env: {
        PORT: 5002,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      error_file: './logs/telegram-error.log',
      out_file: './logs/telegram-out.log',
      merge_logs: true,
    },
  ],
};
