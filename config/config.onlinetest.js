'use strict';
module.exports = appInfo => {
  const config = exports = {};

  // mongoose
  config.mongoose = {
    url: 'mongodb://workerbook:auto2016@10.0.3.205:27017/workerbook',
    options: {},
  }

  // redis
  config.redis = {
    client: {
      port: 6379,
      host: '10.0.3.200',
      password: '',
      db: 0
    }
  }
  return config;
};
