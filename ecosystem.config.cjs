// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'editors-dashboard',
    script: '.output/server/index.mjs',
    instances: 1,
    exec_mode: 'fork',
    cwd: '/var/www/VGEditor',  // Add this line - it's the working directory
    // Logging configuration
    log_file: 'logs/combined.log',
    out_file: 'logs/out.log',
    error_file: 'logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true,
    env: {
      NODE_ENV: 'production',
      PORT: 3020,  // Changed to 3020 to match Apache
      NITRO_PORT: 3020  // Also add this for Nitro
    }
  }]
}