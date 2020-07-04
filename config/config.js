var env = process.env.NODE_ENV || 'centos';
console.log(`NODE_ENV: ${env}`);

if (env === 'development' || env === 'test' || env === 'nso_remote_app_local' || env === 'local' || env === 'centos' || env === 'docker') {
  var config = require('./config.json');
  var envConfig = config[env];

  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}

// console.log(`User and Password: User: ${process.env.NSO_USER}, Password: ${process.env.NSO_PWD}`);
// console.log(`More: NSO_ADDRESS: ${process.env.NSO_ADDRESS}, PYTHON_PATH: ${process.env.PYTHON_PATH}`);