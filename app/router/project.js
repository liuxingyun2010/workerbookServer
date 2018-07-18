const checkJwt = require('../middleware/checkJwt')

module.exports = app => {
  app.get('/projects/', app.jwt, checkJwt(), 'project.list')
  app.get('/projects/:id', app.jwt, 'project.one')
  app.patch('/projects/:id', app.jwt, checkJwt(), 'project.update')
  app.post('/projects/', app.jwt, checkJwt(), 'project.add')
  app.delete('/projects/:id', app.jwt, checkJwt(), 'project.delete')
}

