'use strict';

// had enabled by egg
// exports.static = true;
// had enabled by egg

// jwt
exports.jwt = {
  enable: true,
  package: 'egg-jwt',
}

// mongoose
exports.mongoose = {
  enable: true,
  package: 'egg-mongoose',
}

// redis 配置
exports.redis = {
  enable: true,
  package: 'egg-redis',
}
