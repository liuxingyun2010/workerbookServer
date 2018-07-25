const checkJwt = require('../middleware/checkJwt')

module.exports = app => {
  app.post('/missions/', app.jwt, checkJwt(), 'mission.add')
  app.patch('/missions/:id', app.jwt, checkJwt(), 'mission.update')
  app.delete('/missions/:id/', app.jwt, checkJwt(), 'mission.delete')
  app.get('/missions/info/:id/', app.jwt, 'mission.one')
  app.get('/missions/list', app.jwt, checkJwt(), 'mission.myMissions')
}

