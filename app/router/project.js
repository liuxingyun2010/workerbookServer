const checkJwt = require('../middleware/checkJwt')
const auth = require('../middleware/auth')

module.exports = app => {
  const prefix = '/console'
  app.get(`${prefix}/projects/`, app.jwt, checkJwt(), auth([99]), 'project.list')
  app.get(`/projects/`, app.jwt, checkJwt(), 'project.f_list')
  app.get(`${prefix}/projects/:id`, app.jwt, checkJwt(), 'project.one')
  app.put(`${prefix}/projects/:id`, app.jwt, checkJwt(), auth([99]), 'project.update')
  app.post(`${prefix}/projects/`, app.jwt, checkJwt(), auth([99]), 'project.add')
  app.delete(`${prefix}/projects/:id`, app.jwt, checkJwt(),  auth([99]), 'project.delete')
}

