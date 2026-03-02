module.exports = {
  apps: [{
    name: 'dashboard-lgs',
    script: 'node_modules/.bin/next',
    args: 'start -p 3001',
    cwd: '/var/www/dashboard-lgs',
    env: { NODE_ENV: 'production' }
  }]
}
