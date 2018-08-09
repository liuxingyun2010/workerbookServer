const ResCode = require('../middleware/responseStatus')
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
          isDelete: false
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

        await app.redis.set('wb:analysis:departments', JSON.stringify(departments), 'EX', 100)

        return departments
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
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
          department: app.mongoose.Types.ObjectId(id)
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
          department: app.mongoose.Types.ObjectId(id)
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

          result[d] && result[d].missions.push(item)
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

        await app.redis.set(`wb:analysis:departments:summary:${id}`, JSON.stringify(resultInfo), 'EX', 100)

        return resultInfo
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
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

          // 去重，入库时候去重
          if (missions[missionId] && missions[missionId].data){
            const index = missions[missionId].data.findIndex(i => i.date === item.date)
            if (index > -1) {
              dateInfo.day = item.date
              dateInfo.progress = item.missionProgress
              dateInfo.isDelay = item.missionDelay
              missions[missionId].data.splice(index, 1, dateInfo)
              return
            }
          }

          if (!missions[missionId]){
            missions[missionId] = {}
            missions[missionId].name = item.missionName
            missions[missionId].id = missionId
            missions[missionId].data = []
            missions[missionId].userId = userId
            missions[missionId].deadline = item.missionDeadline
            // missions[missionId].projectId = item.projectId
            // missions[missionId].projectName = item.projectName

            missions[missionId].project = {
              id: item.projectId,
              name: item.projectName
            }
          }

          dateInfo.day = item.date
          dateInfo.progress = item.missionProgress
          dateInfo.isDelay = item.missionDelay
          missions[missionId].data.push(dateInfo)
        })

        for (let key in missions){
          const item = missions[key]
          const userId = item.userId
          const dates = item.data

          // 说明未开始
          if (dates[dates.length - 1].progress === 0) {
            result[userId].waitMissions.push(item)
          }
          else{
            result[userId].missions.push(item)
          }
        }

        const list = Object.values(result)

        await app.redis.set(`wb:analysis:departments:detail:${id}`, JSON.stringify(list), 'EX', 100)

        return list
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
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
          isDelete: false,
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

        const count = await ctx.model.Project.find(params).count()

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
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    //
    async findProjectSummaryAnalysis() {
      try {
        const {
          ctx
        } = this

        const id = ctx.params.id

        const redisAnalysisProjectSummary = await app.redis.get(`wb:analysis:project:summary:${id}`)
        if (redisAnalysisProjectSummary){
          return JSON.parse(redisAnalysisProjectSummary)
        }
        let result = {}
        let missions = {}

        const projectInfo = await ctx.model.Project.findOne({
          isDelete: false,
          status: 1,
          _id: id
        }).populate('missions')

        if (!projectInfo){
          return Promise.reject(ResCode.ProjectIdNotFoundOrArchive)
        }

        const now = new Date()
        result.name = projectInfo.name
        result.deadline = projectInfo.deadline

        if (now > result.deadline) {
          result.isDelay = true
        }
        else {
          result.isDelay = false
        }

        projectInfo.missions && projectInfo.missions.forEach((item, index) => {
          const id = item._id
          const name = item.name
          const deadline = item.deadline

          if (!missions[id]){
            missions[id] = {}
            missions[id].id = id
            missions[id].name = name
            missions[id].deadline = deadline

            if (now > deadline) {
              missions[id].isDelay = true
            }
            else {
              missions[id].isDelay = false
            }
            missions[id].data = []
          }
        })

        const missionsAnalysisList = await ctx.model.Analysis.find({
          projectId: id
        }).sort({
          date: 1
        })

        missionsAnalysisList.forEach((item, index) => {
          const missionId = item.missionId
          const dateInfo = {}

          // 去重，入库时候去重
          if (missions[missionId] && missions[missionId].data.length > 0){
            const index = missions[missionId].data.findIndex(i => i.date === item.date)
            if (index > -1) {
              dateInfo.day = item.date
              dateInfo.progress = item.missionProgress
              dateInfo.isDelay = item.missionDelay
              missions[missionId].data.splice(index, 1, dateInfo)
              return
            }
          }

          if (!missions[missionId]){
            missions[missionId] = {}
            missions[missionId].name = item.missionName
            missions[missionId].id = missionId
            missions[missionId].data = []
            missions[missionId].userId = userId
            missions[missionId].deadline = item.missionDeadline
            missions[missionId].projectId = item.projectId
            missions[missionId].projectName = item.projectName
          }

          dateInfo.day = item.date
          dateInfo.progress = item.missionProgress
          dateInfo.isDelay = item.missionDelay
          missions[missionId].data.push(dateInfo)
        })
        const list = Object.values(missions)
        result.missions = list
        await app.redis.set(`wb:analysis:project:summary:${id}`, JSON.stringify(result), 'EX', 100)
        return result
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }
  }


  return AnalysisService
}
