const ResCode = require('../middleware/responseStatus')
const HttpStatus = require('../middleware/httpStatus')
module.exports = app => {
  class AnalysisService extends app.Service {
    // 获取部门统计列表
    async findDepartmentAnalysis() {
      try {
        const { ctx } = this
        // const redisAnalysisDepartments = await app.redis.get('wb:analysis:departments')
        // if (redisAnalysisDepartments){
        //   return JSON.parse(redisAnalysisDepartments)
        // }

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
        }, '-updateTime -isDelete').populate('user')

        missions.forEach((item, index) => {
          const d = item.department
          const now = new Date()

          if (now > item.deadline) {
            item._doc.isTimeout = true
          }
          else {
            item._doc.isTimeout = false
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
        // const redisAnalysisDepartmentsDetail = await app.redis.get(`wb:analysis:departments:summary:${id}`)
        // if (redisAnalysisDepartmentsDetail){
        //   return JSON.parse(redisAnalysisDepartmentsDetail)
        // }

        const result = {}
        const users = []
        const sql = {
          isDelete: false,
          status: 1,
          department: app.mongoose.Types.ObjectId(id)
        }
        const department = await ctx.service.department.findOneDepartmentByRedis(id)

        const userList = await ctx.model.User.find(sql)
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

        const missions = await ctx.model.Mission.find(sql)

        missions.forEach((item, index) => {
          const d = item.user
          const now = new Date()

          if (now > item.deadline) {
            item._doc.isTimeout = true
          }
          else {
            item._doc.isTimeout = false
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

        // const redisAnalysisDepartmentsDetail = await app.redis.get(`wb:analysis:departments:detail:${id}`)
        // if (redisAnalysisDepartmentsDetail){
        //   return JSON.parse(redisAnalysisDepartmentsDetail)
        // }

        let result = {}
        let reponse = []
        let inProgressMission = []
        let missionsInfo = {}
        let sql = {
          isDelete: false,
          status: 1,
          department: app.mongoose.Types.ObjectId(id)
        }

        const userList = await ctx.model.User.find(sql)

        // 搜出所有目前正在进行的任务
        const hasMissions = await ctx.model.Mission.find({
          isDelete: false,
          status: 1,
        }).populate('project')

        hasMissions.forEach((item, index) => {
          inProgressMission.push(item._id)

          if (!missionsInfo[item._id]) {
            missionsInfo[item._id] = {}
            missionsInfo[item._id].projectName = item.project.name
            missionsInfo[item._id].missionProgress = item.progress
            missionsInfo[item._id].projectId = item.project._id
            missionsInfo[item._id].missionDeadline = item.deadline
            missionsInfo[item._id].missionName = item.name
          }
        })

        userList.forEach((item, index) => {
          const id = item._id
          const nickname = item.nickname
          const title = item.title

          if (!result[id]){
            result[id] = {}
            result[id].id = id
            result[id].nickname = nickname
            result[id].title = title
            result[id].missions = {}
          }
        })

        // 找出目前统计表中所有正在进行的任务
        const missionsAnalysisList = await ctx.model.Analysis.find({
          missionId: {
            $in: hasMissions
          }
        }).sort({
          date: 1
        })

        missionsAnalysisList.forEach((item, index) => {
          const userId = item.userId
          const missionId = item.missionId

          const dateInfo = {}
          if (!result[userId]) {
            return
          }

          if (!result[userId]['missions'][missionId]) {
            result[userId]['missions'][missionId] = {}

            const r = result[userId]['missions'][missionId]
            r.name = missionsInfo[missionId].missionName
            r.id = missionId
            r.data = []
            r.project = {}
            r.deadline = missionsInfo[missionId].missionDeadline
            r.project.name = missionsInfo[missionId].projectName
            r.project.id = missionsInfo[missionId].projectId
            r.progress = missionsInfo[missionId].missionProgress
          }

          dateInfo.day = item.date
          dateInfo.progress = item.progress
          result[userId]['missions'][missionId].data.push(dateInfo)
        })

        const list = Object.values(result)

        list.forEach((item, index) => {
          const u = {}

          const m = Object.values(item.missions)
          u.id = item.id
          u.nickname = item.nickname
          u.missions = m
          u.title = item.title
          reponse.push(u)
        })

        await app.redis.set(`wb:analysis:departments:detail:${id}`, JSON.stringify(reponse), 'EX', 100)

        return reponse
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
            item._doc.isTimeout = true
          }
          else {
            item._doc.isTimeout = false
          }

          const oneDay = 24*3600*1000

          const totalDay = Math.ceil((item.deadline - item.createTime) / oneDay)
          const costDay = Math.ceil((new Date() - item.createTime) / oneDay)

          item._doc.costDay = costDay
          item._doc.totalDay = totalDay

          missions.forEach(doc => {
            if (now > doc.deadline) {
              doc._doc.isTimeout = true
            }
            else {
              doc._doc.isTimeout = false
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

        // const redisAnalysisProjectSummary = await app.redis.get(`wb:analysis:project:summary:${id}`)
        // if (redisAnalysisProjectSummary){
        //   return JSON.parse(redisAnalysisProjectSummary)
        // }
        let result = {}
        let missions = {}
        let missionIds = []
        let missionInfo = {}

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
          result.isTimeout = true
        }
        else {
          result.isTimeout = false
        }

        projectInfo.missions && projectInfo.missions.forEach((item, index) => {
          const id = item._id
          const name = item.name
          const deadline = item.deadline
          missionIds.push(id)
          if (!missions[id]){
            missions[id] = {}
            missions[id].id = id
            missions[id].name = name
            missions[id].deadline = deadline

            if (now > deadline) {
              missions[id].isTimeout = true
            }
            else {
              missions[id].isTimeout = false
            }
            missions[id].data = []


            missionInfo[id] = {}
            missionInfo[id].id = id
            missionInfo[id].name = name
            missionInfo[id].deadline = deadline
          }
        })

        const missionsAnalysisList = await ctx.model.Analysis.find({
          missionId: {
            $in: missionIds
          }
        }).sort({
          date: 1
        })

        missionsAnalysisList.forEach((item, index) => {
          const missionId = item.missionId
          const dateInfo = {}

          // // 去重，入库时候去重
          // if (missions[missionId] && missions[missionId].data.length > 0){
          //   const index = missions[missionId].data.findIndex(i => i.date === item.date)
          //   if (index > -1) {
          //     dateInfo.day = item.date
          //     dateInfo.progress = item.missionProgress
          //     dateInfo.isTimeout = item.missionDelay
          //     missions[missionId].data.splice(index, 1, dateInfo)
          //     return
          //   }
          // }

          if (!missions[missionId]){
            missions[missionId] = {}
            missions[missionId].name = mimissionInfo[missionId].name
            missions[missionId].id = missionId
            missions[missionId].data = []
            missions[missionId].userId = userId
            missions[missionId].deadline = mimissionInfo[missionId].name
            // missions[missionId].projectId = item.projectId
            // missions[missionId].projectName = item.projectName
          }

          dateInfo.day = item.date
          dateInfo.progress = item.progress
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
