const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')
const moment = require('moment')
module.exports = app => {
  class AnalysisService extends app.Service {
    // 获取部门统计列表
    async findDepartmentAnalysis() {
      try {
        const { ctx } = this

        // const departments = await ctx.model.Department.find({}, 'name count')

        const result = {}
        const departments = []
        // for (let i = 0;  i < departments.length; i++) {
        //   const id = departments[i]._id
        //   result[id] = departments[i]
        //   result[id]._doc.missions = []
        // }

        const missions = await ctx.model.Mission.find({
          status: 1,
          isDelete: false
        }, '-updateTime -isDelete')

        // let missions = []
        missions.forEach((item, index) => {
          const d = item.department
          if (!result[d]){
            result[d] = {}
            result[d].missions = []
          }

          const now = moment()
          if (now > moment(item.deadline)) {
            item._doc.isDelay = true
          }
          else {
            item._doc.isDelay = false
          }

          result[d].missions.push(item)
        })
        console.log(Object.keys(result))
        for (let key in result){
          console.log(key)
          const obj = {}
          const item = result[key]
          obj.id = key
          
          // 需要查redis
          const departmentInfo = await ctx.service.department.findDepartment({
            _id: key
          })

          obj.name = departmentInfo.name
          obj.missions = item.missions

          departments.push(obj)
        }

        console.log(departments)
        // 最终的数据也需要存redis
        return departments
      } catch (e) {
        console.log(e)
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }
  }
  return AnalysisService
}
