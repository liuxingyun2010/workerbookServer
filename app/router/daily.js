const checkJwt = require('../middleware/checkJwt')

module.exports = app => {
  app.post(`/dailies/`, app.jwt, checkJwt(), 'daily.add')
  app.put(`/dailies/:id`, app.jwt, checkJwt(), 'daily.update')
  app.delete(`/dailies/:id`, app.jwt, checkJwt(), 'daily.delete')
  app.get(`/dailies/`, app.jwt, checkJwt(), 'daily.list')
  app.get(`/dailies/profile`, app.jwt, checkJwt(), 'daily.today')
}

