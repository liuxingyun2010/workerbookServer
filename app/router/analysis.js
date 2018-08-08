const checkJwt = require('../middleware/checkJwt')

module.exports = app => {
  app.get(`/analysis/department`, app.jwt, checkJwt(), 'analysis.departmentList')
  app.get(`/analysis/department/summary/:id`, app.jwt, checkJwt(), 'analysis.departmentSummaryList')
  app.get(`/analysis/department/detail/:id`, app.jwt, checkJwt(), 'analysis.departmentUserAnalysis')
  app.get(`/analysis/project`, app.jwt, checkJwt(), 'analysis.projectList')
  app.get(`/analysis/project/summary/:id`, app.jwt, checkJwt(), 'analysis.projectSummary')

}

