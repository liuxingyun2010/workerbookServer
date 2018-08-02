const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')
module.exports = app => {
  class AnalysisService extends app.Service {
    // 获取部门统计列表
    async findDepartmentAnalysis() {
      try {
        const { ctx } = this

        const redisAnalysisDepartments = await app.redis.get('wb:analysis:departments')
        if (redisAnalysisDepartments){
          return JSON.parse(redisAnalysisDepartments)
        }

        const result = {}
        const departments = []

        const departmentList = await ctx.model.Department.find({
          isDelete: false,
          status: 1
        })

        departmentList.forEach((item, index) => {
          const id = item._id
          const name = item.name
          const count = item.count
          if (!result[id]){
            result[id] = {}
            result[id].id = id
            result[id].name = name
            result[id].count = count
            result[id].missions = []
          }
        })

        const missions = await ctx.model.Mission.find({
          status: 1,
          isDelete: false
        }, '-updateTime -isDelete')

        missions.forEach((item, index) => {
          const d = item.department

          const now = new Date()

          if (now > item.deadline) {
            item._doc.isDelay = true
          }
          else {
            item._doc.isDelay = false
          }

          result[d].missions.push(item)
        })


        for (let key in result){
          const item = result[key]
          result[key].missions = item.missions
          departments.push(result[key])
        }

        await app.redis.set('wb:analysis:departments', JSON.stringify(departments), 'EX', 7200)

        return departments
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 部门所有人员概况
    async findDepartmentSummaryAnalysis(){
      try {
        const { ctx } = this
        const id = ctx.params.id
        const redisAnalysisDepartmentsDetail = await app.redis.get(`wb:analysis:departments:${id}`)
        if (redisAnalysisDepartmentsDetail){
          return JSON.parse(redisAnalysisDepartmentsDetail)
        }

        const result = {}
        const users = []

        const department = await ctx.service.department.findOneDepartmentByRedis(id)

        const userList = await ctx.model.User.find({
          isDelete: false,
          status: 1,
          department: id
        })
        userList.forEach((item, index) => {
          const id = item._id
          const nickname = item.nickname
          if (!result[id]){
            result[id] = {}
            result[id].id = id
            result[id].nickname = nickname
            result[id].missions = []
          }
        })

        const missions = await ctx.model.Mission.find({
          status: 1,
          isDelete: false,
          department: id
        }, '-updateTime -isDelete')

        missions.forEach((item, index) => {
          const d = item.user

          const now = new Date()

          if (now > item.deadline) {
            item._doc.isDelay = true
          }
          else {
            item._doc.isDelay = false
          }

          result[d].missions.push(item)
        })


        for (let key in result){
          const item = result[key]
          result[key].missions = item.missions
          users.push(result[key])
        }

        const resultInfo = {
          id: department._id,
          name: department.name,
          list: users
        }

        await app.redis.set(`wb:analysis:departments:summary:${id}`, JSON.stringify(resultInfo), 'EX', 7200)

        return resultInfo
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 部门所有人每天的任务详情
    async findDepartmentUserAnalysis() {
      try {
        const {
          ctx
        } = this
        
        const id = ctx.params.id
        let result = {}
        let missions = {}
        
        const userList = await ctx.model.User.find({
          isDelete: false,
          status: 1,
          department: id
        })

        userList.forEach((item, index) => {
          const id = item._id
          const nickname = item.nickname
          if (!result[id]){
            result[id] = {}
            result[id].id = id
            result[id].nickname = nickname
            result[id].missions = []
          }
        })
        
        const missionsAnalysisList = await ctx.model.Analysis.find({
          departmentId: id
        }).sort({
          createTime: -1
        })
        
        missionsAnalysisList.forEach((item, index) => {
          const userId = item.userId
          const missionId = item.missionId
          const dateInfo = {}
          if (!missions[missionId]){
            missions[missionId] = {}
            missions[missionId].name = item.missionName
            missions[missionId].id = item.missionId
            missions[missionId].dates = []
          }

          dateInfo.date = item.date
          dateInfo.progress = item.missionProgress
          dateInfo.isDelay = item.missionDelay
          missions[missionId].dates.push(dateInfo)
            

          result[userId].dates.push(dateInfo)
        })

        // result[id].missions = missions

        return result
      } catch (e) {
        console.log(e)
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

     // 获取项目统计列表
    async findProjectAnalysis() {
      try {
        const {
          ctx
        } = this

        let result = {}
        let projects = []

        let params = {
          isDelete: {
            $ne: true
          },
          status: 1
        }

        let {
          skip = 0, limit = 0
        } = ctx.query
        skip = Number(skip)
        limit = Number(limit)

        const list = await ctx.model.Project.find(params, '-updateTime -isDelete -status -departments').skip(skip).limit(limit)

        const count = await ctx.model.Project.find(params).skip(skip).limit(limit).count()

        result.count = count

        list.forEach(item => {
          const now = new Date()

          if (now > item.deadline) {
            item._doc.isDelay = true
          }
          else {
            item._doc.isDelay = false
          }

          const oneDay = 24*3600*1000

          const totalDay = Math.ceil((item.deadline - item.createTime) / oneDay)
          const costDay = Math.ceil((new Date() - item.createTime) / oneDay)

          item._doc.costDay = costDay
          item._doc.totalDay = totalDay

          projects.push(item)
        })

        result.list = projects

        if (limit) {
          result.limit = limit
          result.skip = skip
        }

        return result
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
