const checkJwt = require('../middleware/checkJwt')

module.exports = app => {
  app.post('/missions/', app.jwt, checkJwt(), 'mission.add')
  app.patch('/missions/:id', app.jwt, checkJwt(), 'mission.update')
  // app.get('/departments/', app.jwt, 'department.list')
  // app.get('/departments/:id', app.jwt, 'department.findOne')
  app.delete('/missions/:id', app.jwt, checkJwt(), 'mission.delete')
}

