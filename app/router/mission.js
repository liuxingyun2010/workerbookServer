const checkJwt = require('../middleware/checkJwt')
const auth = require('../middleware/auth')

module.exports = app => {
  app.post('/missions/', app.jwt, checkJwt(), auth([99, 2]), 'mission.add')
  app.patch('/missions/:id', app.jwt, checkJwt(), auth([99, 2]), 'mission.update')
  app.delete('/missions/:id/', app.jwt, checkJwt(), auth([99, 2]), 'mission.delete')
  app.get('/missions/info/:id/', app.jwt, 'mission.one')
  app.get('/missions/list', app.jwt, checkJwt(), 'mission.myMissions')
}

