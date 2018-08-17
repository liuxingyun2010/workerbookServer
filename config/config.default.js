'use strict';
const path = require('path')

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1530774923245_3881';

  // add your config here
  config.middleware = ['request','response'];

  // api base url
  config.apiBaseUrl = 'api'


  config.security = {
    csrf: {
      enable: false,
    },
  }

  config.jwt = {
    secret: '$@aotu2018@$'
  }

  // mongoose
  config.mongoose = {
    url: 'mongodb://127.0.0.1:27017/workbook',
    options: {},
  }

  // redis
  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0
    }
  }
  return config;
};
