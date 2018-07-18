const checkJwt = require('../middleware/checkJwt')

module.exports = app => {
  app.post('/departments/', app.jwt, checkJwt(), 'department.add')
  app.patch('/departments/:id', app.jwt, checkJwt(), 'department.update')
  app.get('/departments/', app.jwt, 'department.list')
  app.get('/departments/:id', app.jwt, 'department.findOne')
  app.delete('/departments/:id', app.jwt, checkJwt(), 'department.delete')
}

