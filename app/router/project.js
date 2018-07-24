const checkJwt = require('../middleware/checkJwt')

module.exports = app => {
  const prefix = '/console'
  app.get(`${prefix}/projects/`, app.jwt, checkJwt(), 'project.list')
  app.get(`/projects/`, app.jwt, checkJwt(), 'project.f_list')
  app.get(`${prefix}/projects/:id`, app.jwt, checkJwt(), 'project.one')
  app.patch(`${prefix}/projects/:id`, app.jwt, checkJwt(), 'project.update')
  app.post(`${prefix}/projects/`, app.jwt, checkJwt(), 'project.add')
  app.delete(`${prefix}/projects/:id`, app.jwt, checkJwt(), 'project.delete')
}

