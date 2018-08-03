const checkJwt = require('../middleware/checkJwt')
const auth = require('../middleware/auth')

module.exports = app => {
  app.post('/events/', app.jwt, checkJwt(), auth([99]), 'event.add')
  app.put('/events/:id', app.jwt, checkJwt(), auth([99]), 'event.update')
  app.delete('/events/:id/', app.jwt, checkJwt(), auth([99]), 'event.delete')
  app.get('/events/info/:id/', app.jwt, 'event.one')
  app.get('/events/list', app.jwt, checkJwt(), 'event.list')
}

