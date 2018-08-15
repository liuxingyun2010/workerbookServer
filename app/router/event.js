const checkJwt = require('../middleware/checkJwt')
const auth = require('../middleware/auth')

module.exports = app => {
  const prefix = '/console'
  app.post(`${prefix}/events/`, app.jwt, checkJwt(), auth([99]), 'event.add')
  app.put(`${prefix}/events/:id`, app.jwt, checkJwt(), auth([99]), 'event.update')
  app.delete(`${prefix}/events/:id/`, app.jwt, checkJwt(), auth([99]), 'event.delete')
  app.get(`${prefix}/events/info/:id/`, app.jwt, checkJwt(), auth([99]), 'event.one')
  app.get(`${prefix}/events/list`, app.jwt, checkJwt(), auth([99]), 'event.list')
  app.get(`/events/list`, app.jwt, checkJwt(), 'event.list')
}

