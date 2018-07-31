const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  class AnalysisService extends app.Service {
    // 获取部门统计列表
    async findDepartmentAnalysis() {
      try {
        const { ctx } = this

        const departments = await ctx.model.Department.find({}, 'name count')

        const result = {}
        for (let i = 0;  i < departments.length; i++) {
          const id = departments[i]._id
          result[id] = departments[i]
          result[id]._doc.missions = []
        }

        const projects = await ctx.model.Mission.find({
          status: 1
        })

        let missions = []
        projects.forEach((item, index) => {
          missions = missions.concat(item.missions)
        })

        console.log(missions)

        missions.forEach((item, index) => {

        })

        return 1
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }
  }
  return AnalysisService
}
