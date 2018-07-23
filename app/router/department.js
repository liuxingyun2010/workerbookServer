const checkJwt = require('../middleware/checkJwt')

module.exports = app => {
  const prefix = '/console'
  app.get(`/departments/`, app.jwt, 'department.f_list')
  app.post(`${prefix}/departments/`, app.jwt, checkJwt(), 'department.add')
  app.patch(`${prefix}/departments/:id`, app.jwt, checkJwt(), 'department.update')
  app.get(`${prefix}/departments/`, app.jwt, 'department.list')
  app.get(`${prefix}/departments/:id`, app.jwt, 'department.findOne')
  app.delete(`${prefix}/departments/:id`, app.jwt, checkJwt(), 'department.delete')
}

