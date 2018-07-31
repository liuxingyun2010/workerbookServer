const checkJwt = require('../middleware/checkJwt')

module.exports = app => {
  app.get(`/analysis/department`, app.jwt, checkJwt(), 'analysis.departmentList')
}

