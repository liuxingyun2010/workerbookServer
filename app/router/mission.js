const checkJwt = require('../middleware/checkJwt')

module.exports = app => {
  app.post('/missions/', app.jwt, checkJwt(), 'mission.add')
  app.patch('/missions/:id', app.jwt, checkJwt(), 'mission.update')
  // app.get('/departments/', app.jwt, 'department.list')
  app.put('/missions/:id/persons/:uid', app.jwt, checkJwt(), 'mission.person')
  app.delete('/missions/:id/persons/:uid', app.jwt, checkJwt(), 'mission.delPerson')
}

