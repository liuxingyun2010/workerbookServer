const checkJwt = require('../middleware/checkJwt')
module.exports = app => {
  const prefix = '/console'
  app.post(`/users/login`, 'user.login')
  app.get(`/users/profile`, app.jwt, checkJwt(), 'user.profile')
  app.get(`/users/`, app.jwt, 'user.list')
  app.post(`${prefix}/users/`, app.jwt, checkJwt(), 'user.add')
  app.put(`${prefix}/users/:id`, app.jwt, checkJwt(), 'user.edit')
  app.patch(`${prefix}/users/editPwd/:id`, app.jwt, checkJwt(), 'user.editPwd')
  app.patch(`${prefix}/users/resetPwd/:id`, app.jwt, checkJwt(), 'user.resetPwd')
  app.get(`${prefix}/users/:id`, app.jwt, 'user.getUser')
  app.delete(`${prefix}/users/:id`, app.jwt, checkJwt(), 'user.delete')
  app.get(`${prefix}/users/`, app.jwt, 'user.list')
}

