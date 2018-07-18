const checkJwt = require('../middleware/checkJwt')
module.exports = app => {
  app.post('/users/login', 'user.login')
  app.post('/users/', app.jwt, checkJwt(), 'user.add')
  app.put('/users/:id', app.jwt, checkJwt(), 'user.edit')
  app.get('/users/profile', app.jwt, checkJwt(), 'user.profile')
  app.get('/users/:id', app.jwt, 'user.getUser')
  app.delete('/users/:id', app.jwt, checkJwt(), 'user.delete')
  app.get('/users/', app.jwt, 'user.list')
}

