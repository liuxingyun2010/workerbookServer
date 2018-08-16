const ResCode = require('../middleware/responseStatus')
const HttpStatus = require('../middleware/httpStatus')
const moment = require('moment')

module.exports = app => {
  class AnalysisService extends app.Service {
    // 获取部门统计列表
    async findDepartmentAnalysis() {
      try {
        const { ctx } = this

        const result = {}
        const departments = []
        const data = {}

        let {
          skip = 0, limit = 0
        } = ctx.query
        skip = Number(skip)
        limit = Number(limit)

        const count = await ctx.model.Department.find({isDelete: false}).count()

        data.count = count

        const departmentList = await ctx.model.Department.find({
          isDelete: false
        }).skip(skip).limit(limit)

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

          result[d] && result[d].missions && result[d].missions.push(item)
        })


        for (let key in result){
          const item = result[key]
          result[key].missions = item.missions
          departments.push(result[key])
        }

        data.list = departments

        if (limit) {
          data.limit = limit
          data.skip = skip
        }

        return data
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

          result[d] && result[d].missions && result[d].missions.push(item)
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

        // await app.redis.set(`wb:analysis:departments:summary:${id}`, JSON.stringify(resultInfo), 'EX', 7200)

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
        let users = []
        let tempUserMission = {}

        let sql = {
          isDelete: false,
          status: 1,
          department: app.mongoose.Types.ObjectId(id)
        }

        const userList = await ctx.model.User.find(sql)

        userList.forEach((item, index) => {
          const id = item._id
          const nickname = item.nickname
          const title = item.title
          users.push(id)
          if (!result[id]){
            result[id] = {}
            result[id].id = id
            result[id].nickname = nickname
            result[id].title = title
            result[id].missions = {}
          }
        })

        // 搜出所有目前正在进行的任务
        const hasMissions = await ctx.model.Mission.find({
          isDelete: false,
          status: 1,
          user: {
            $in: users
          }
        }).populate('project')

        hasMissions.forEach((item, index) => {
          const userId = item.user
          const missionId = item._id

          inProgressMission.push(missionId)

          if (!result[userId]) {
            return
          }

          if (!result[userId]['missions'][missionId]) {
            result[userId]['missions'][missionId] = {}
            const r = result[userId]['missions'][missionId]
            r.name = item.name
            r.id = missionId
            r.data = []
            r.project = {}
            r.deadline = item.deadline
            r.project.name = item.project.name
            r.project.id = item.project._id
            r.progress = item.progress
            r.today = moment().format('YYYY-MM-DD')
            r.createTime = item.createTime
            tempUserMission[missionId] = userId
          }
        })


        // 找出目前统计表中所有正在进行的任务
        const missionsAnalysisList = await ctx.model.Analysis.find({
          missionId: {
            $in: inProgressMission
          }
        }).sort({
          date: 1
        })

        missionsAnalysisList.forEach((item, index) => {
          const missionId = item.missionId
          const userId = tempUserMission[missionId]
          const dateInfo = {}
          if (!result[userId] || !result[userId]['missions'] || !result[userId]['missions'][missionId]) {
            return
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

        // await app.redis.set(`wb:analysis:departments:detail:${id}`, JSON.stringify(reponse), 'EX', 7200)

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
              progress: 1,
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

          // 所有任务的进度 除以 数量 得到项目进度
          let countProgress = 0
          missions.forEach(doc => {
            if (now > doc.deadline) {
              doc._doc.isTimeout = true
            }
            else {
              doc._doc.isTimeout = false
            }
            countProgress += doc.progress
          })

          item._doc.progress = Math.floor(countProgress / missions.length) || 0

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

    // 获取每个项目的具体详情数据
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

        const projectInfo = await ctx.model.Project.findOne({
          isDelete: false,
          status: 1,
          _id: id
        })
        .populate({
          path: 'missions'
        })

        if (!projectInfo){
          return Promise.reject(ResCode.ProjectIdNotFoundOrArchive)
        }

        const now = new Date()
        result.name = projectInfo.name
        result.deadline = projectInfo.deadline
        result.createTime = projectInfo.createTime
        if (now > result.deadline) {
          result.isTimeout = true
        }
        else {
          result.isTimeout = false
        }

        let totalProgress = 0
        let totalMissions = projectInfo.missions || []

        totalMissions.forEach(async (item, index) => {
          const id = item._id
          const name = item.name
          const deadline = item.deadline
          const createTime = item.createTime
          const userId = item.user

          missionIds.push(id)

          totalProgress += item.progress
          if (!missions[id]){
            missions[id] = {}
            missions[id].id = id
            missions[id].name = name
            missions[id].deadline = deadline
            missions[id].createTime = createTime
            if (now > deadline) {
              missions[id].isTimeout = true
            }
            else {
              missions[id].isTimeout = false
            }
            missions[id].data = []

            // 从缓存中获取
            const userInfo = await ctx.service.user.getOneUser(userId)
            missions[id].user = {}
            missions[id].user.nickname = userInfo.nickname || ''
            missions[id].user.id = userInfo._id || ''
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
          dateInfo.day = item.date
          dateInfo.progress = item.progress
          missions[missionId].data.push(dateInfo)
        })
        const list = Object.values(missions)
        result.missions = list
        result.progress = Math.floor(totalProgress / totalMissions.length)
        // await app.redis.set(`wb:analysis:project:summary:${id}`, JSON.stringify(result), 'EX', 100)
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
