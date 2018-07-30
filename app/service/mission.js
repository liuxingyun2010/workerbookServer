const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  class ProjectService extends app.Service {
    // 添加任务
    async save() {
      try {
        const {
          ctx
        } = this
        const requestBody = ctx.request.body
        const {
          name,
          deadline,
          projectId,
          userId
        } = requestBody


        if (!name) {
          return Promise.reject({
            code: ResCode.MissionNameEmpty
          })
        }

        if (!ctx.helper.isObjectId(projectId)) {
          return Promise.reject({
            code: ResCode.MissionProjectIdError
          })
        }

        if (!ctx.helper.isObjectId(userId)) {
          return Promise.reject({
            code: ResCode.UserIdIlligal
          })
        }

        if (!deadline) {
          return Promise.reject({
            code: ResCode.MissionDeadlineEmpty
          })
        }

        // 判断项目是否存在
        const projectInfo = await ctx.service.project.findProjectById(projectId)

        if (!projectInfo) {
          return Promise.reject({
            code: ResCode.MissionProjectDontExist
          })
        }

        // 如果项目存在，则需要判断任务的截止时间不能大于项目的截止时间
        if (new Date(projectInfo.deadline) < new Date(deadline)) {
          return Promise.reject({
            code: ResCode.MissionDeadlineError
          })
        }

        const missionResult = await ctx.model.Mission.create({
          name,
          deadline,
          user: app.mongoose.Types.ObjectId(userId),
          project: app.mongoose.Types.ObjectId(projectId)
        })

        if (missionResult) {
          const missionId = missionResult._id
          await ctx.service.project.addMission(projectId, missionId)
        }
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 更新进度
    async updateProgress(obj) {
      try {
        const {
          ctx
        } = this

        const id = obj.missionId
        const progress = obj.progress || 0


        if (progress && !ctx.helper.isInt(progress) && progress <=100) {
          return Promise.reject({
            code: ResCode.DailyProgressIlligeal
          })
        }

        let missionInfo = await this.findOneById(id)

        if (!missionInfo) {
          return Promise.reject({
            code: ResCode.MissionNotFount
          })
        }

        const projectId = missionInfo.project? missionInfo.project._id: ''

        if (!projectId){
          return Promise.reject({
            code: ResCode.MissionProjectDontExist
          })
        }

        // 判断项目是否存在
        const projectInfo = await ctx.service.project.findProjectById(projectId)

        if (!projectInfo) {
          return Promise.reject({
            code: ResCode.MissionProjectDontExist
          })
        }

        // 找到并且更新
        return await ctx.model.Mission.update({
          _id: id
        }, {
          $set: {
            progress
          }
        })
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 更新任务
    async update() {
      try {
        const {
          ctx
        } = this
        const id = ctx.params.id
        const requestBody = ctx.request.body

        const {
          name,
          deadline,
          userId,
        } = requestBody

        const sql = {}

        if (name){
          sql.name = name
        }

        if (deadline) {
          sql.deadline = deadline
        }

        if (userId && !ctx.helper.isObjectId(userId)) {
          return Promise.reject({
            code: ResCode.UserIdIlligal
          })
        }

        if (userId){
          sql.user = app.mongoose.Types.ObjectId(userId)
        }

        let missionInfo = await this.findOneById(id)

        if (!missionInfo) {
          return Promise.reject({
            code: ResCode.MissionNotFount
          })
        }

        const projectId = missionInfo.project? missionInfo.project._id: ''

        if (!projectId){
          return Promise.reject({
            code: ResCode.MissionProjectDontExist
          })
        }

        // 判断项目是否存在
        const projectInfo = await ctx.service.project.findProjectById(projectId)

        if (!projectInfo) {
          return Promise.reject({
            code: ResCode.MissionProjectDontExist
          })
        }

        // 如果项目存在，则需要判断任务的截止时间不能大于项目的截止时间
        if (deadline && new Date(projectInfo.deadline) < new Date(deadline)) {
          return Promise.reject({
            code: ResCode.MissionDeadlineError
          })
        }

        // 找到并且更新
        return await ctx.model.Mission.update({
          _id: id
        }, {
          $set: sql
        })
      } catch (e) {
        console.log(e)
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 删除任务
    async delete() {
      try {
        const {
          ctx
        } = this
        const id = ctx.params.id

        if (!this.ctx.helper.isObjectId(id)) {
          return Promise.reject({
            code: ResCode.MissionIdError
          })
        }

        // 找到并且更新
        const result = await ctx.model.Mission.update({
          _id: id
        }, {
          $set: {
            isDelete: true
          }
        })

        if (!result.n) {
          return Promise.reject({
            code: ResCode.MissionNotFount
          })
        }

      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }


    // 查询单个任务，包含项目和个人信息
    async findOne() {
      try {
        const {
          ctx
        } = this
        const id = ctx.params.id

        let result = await this.findOneById(id)

        return result

      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }


    // 查找任务，通过任务id
    async findOneById(id) {
      if (!this.ctx.helper.isObjectId(id)) {
        return Promise.reject({
          code: ResCode.MissionIdError
        })
      }

      const result = await app.redis.get(`wb:mission:${id}`)
      if (result) {
        return JSON.parse(result)
      }


      let info = await this.ctx.model.Mission.findOne({
        _id: id,
        isDelete: false
      }).populate({
        path: 'user',
        select: '-updateTime -username -password'
      }).populate({
        path: 'project',
        select: '-missions -isDelete -updateTime'
      }).populate({
        path: 'event'
      })

      if (info) {
        await app.redis.set(`wb:mission:${id}`, JSON.stringify(info))
      }

      return info
    }

    // 获取用户的任务列表
    async findMissions() {
      try {
        const {
          ctx
        } = this
        let {
          skip = 0, limit = 0, userId
        } = ctx.query
        if (!userId) {
          userId = ctx.userInfo._id
        }

        let result = {}

        let params = {
          isDelete: false,
          status: 1,
          user: app.mongoose.Types.ObjectId(userId)
        }


        skip = Number(skip)
        limit = Number(limit)

        const list = await ctx.model.Mission.find(params, '-updateTime -isDelete').skip(skip).limit(limit).populate({
          path: 'project',
          select: '-missions -isDelete -updateTime'
        })

        const count = await ctx.model.Mission.find(params).count()

        result.count = count
        result.list = list

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
  return ProjectService
}
