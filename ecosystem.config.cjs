module.exports = {
  apps: [
    {
      name: 'editors-dashboard',
      port: '3090',
      exec_mode: 'fork',
      instances: '1',
      script: './.output/server/index.mjs',
      env: {
        NITRO_PORT: 3090,
        NITRO_HOST: '0.0.0.0',
        PORT: 3090,
        HOST: '0.0.0.0',
        NODE_ENV: 'production'
      }
    }
  ]
};