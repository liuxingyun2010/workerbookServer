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
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 部门所有人员概况
    async findDepartmentSummaryAnalysis(){
      try {
        const { ctx } = this
        const id = ctx.params.id
        const redisAnalysisDepartmentsDetail = await app.redis.get(`wb:analysis:departments:summary:${id}`)
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
          error: e,
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

        const redisAnalysisDepartmentsDetail = await app.redis.get(`wb:analysis:departments:detail:${id}`)
        if (redisAnalysisDepartmentsDetail){
          return JSON.parse(redisAnalysisDepartmentsDetail)
        }

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
            result[id].waitMissions = []
          }
        })

        const missionsAnalysisList = await ctx.model.Analysis.find({
          departmentId: id
        }).sort({
          date: 1
        })

        missionsAnalysisList.forEach((item, index) => {
          const userId = item.userId
          const missionId = item.missionId
          const dateInfo = {}

          // 去重
          if (missions[missionId] && missions[missionId].dates){
            const index = missions[missionId].dates.findIndex(i => i.date === item.date)
            if (index > -1) {
              dateInfo.date = item.date
              dateInfo.progress = item.missionProgress
              dateInfo.isDelay = item.missionDelay
              missions[missionId].dates.splice(index, 1, dateInfo)
              return
            }
          }

          if (!missions[missionId]){
            missions[missionId] = {}
            missions[missionId].name = item.missionName
            missions[missionId].id = missionId
            missions[missionId].dates = []
            missions[missionId].userId = userId
            missions[missionId].deadline = item.missionDeadline
            missions[missionId].projectId = item.projectId
            missions[missionId].projectName = item.projectName
          }

          dateInfo.date = item.date
          dateInfo.progress = item.missionProgress
          dateInfo.isDelay = item.missionDelay
          missions[missionId].dates.push(dateInfo)
        })

        for (let key in missions){
          const item = missions[key]
          const userId = item.userId
          const dates = item.dates

          // 说明未开始
          if (dates[dates.length - 1].progress === 0) {
            result[userId].waitMissions.push(item)
          }
          else{
            result[userId].missions.push(item)
          }
        }

        const list = Object.values(result)

        await app.redis.set(`wb:analysis:departments:detail:${id}`, JSON.stringify(list), 'EX', 7200)

        return list
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          error: e,
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

        const list = await ctx.model.Project.find(params, '-updateTime -isDelete -status -departments')
          .populate({
            path: 'missions',
            select: {
              _id:1,
              name: 1,
              deadline: 1
            }
          }).skip(skip).limit(limit)

        const count = await ctx.model.Project.find(params).skip(skip).limit(limit).count()

        result.count = count

        list.forEach(item => {
          const now = new Date()
          const missions = item.missions
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

          missions.forEach(doc => {
            if (now > doc.deadline) {
              doc._doc.isDelay = true
            }
            else {
              doc._doc.isDelay = false
            }
          })

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
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }
  }


  return AnalysisService
}
