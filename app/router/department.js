const checkJwt = require('../middleware/checkJwt')
const auth = require('../middleware/auth')

module.exports = app => {
  const prefix = '/console'
  app.get(`/departments/`, app.jwt, 'department.f_list')
  app.post(`${prefix}/departments/`, app.jwt, checkJwt(), auth([99]), 'department.add')
  app.put(`${prefix}/departments/:id`, app.jwt, checkJwt(), auth([99]), 'department.update')
  app.get(`${prefix}/departments/`, app.jwt, checkJwt(), auth([99]), 'department.list')
  app.get(`${prefix}/departments/:id`, app.jwt, checkJwt(), auth([99]), 'department.findOne')
  app.delete(`${prefix}/departments/:id`, app.jwt, checkJwt(), auth([99]), 'department.delete')
}

