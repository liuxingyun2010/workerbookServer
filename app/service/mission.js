const ResCode = require('../middleware/responseStatus')
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
          return Promise.reject(ResCode.MissionNameNotFound)
        }

        if (!ctx.helper.isObjectId(projectId)) {
          return Promise.reject(ResCode.ProjectNotFound)
        }

        if (!ctx.helper.isObjectId(userId)) {
          return Promise.reject(ResCode.UserIdIllegal)
        }

        if (!deadline) {
          return Promise.reject(ResCode.MissionDeadlineNotFound)
        }

        const userInfo = await ctx.service.user.findUserById(userId)
        const departmentId = userInfo && userInfo.department && userInfo.department._id || ''

        // 判断项目是否存在
        const projectInfo = await ctx.service.project.findProjectById(projectId)

        if (!projectInfo) {
          return Promise.reject(ResCode.ProjectDontExist)
        }

        // 如果项目存在，则需要判断任务的截止时间不能大于项目的截止时间
        if (new Date(projectInfo.deadline) < new Date(deadline)) {
          return Promise.reject(ResCode.MissionDeadlineOverProjectDeadline)
        }

        const missionResult = await ctx.model.Mission.create({
          name,
          deadline,
          user: app.mongoose.Types.ObjectId(userId),
          project: app.mongoose.Types.ObjectId(projectId),
          department: app.mongoose.Types.ObjectId(departmentId)
        })

        if (missionResult) {
          const missionId = missionResult._id
          await ctx.service.project.addMission(projectId, missionId)
        }
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
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
          return Promise.reject(ResCode.DailyProgressIllegal)
        }

        let missionInfo = await this.findOneById(id)

        if (!missionInfo) {
          return Promise.reject(ResCode.MissionNotFound)
        }

        const projectId = missionInfo.project? missionInfo.project._id: ''

        if (!projectId){
          return Promise.reject(ResCode.ProjectDontExist)
        }
        // 判断项目是否存在
        const projectInfo = await ctx.service.project.findProjectById(projectId)

        if (!projectInfo) {
          return Promise.reject(ResCode.ProjectDontExist)
        }

        // 找到并且更新
        await app.redis.del(`wb:mission:${id}`)

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
          ...ResCode.Error,
          error: e,
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
          return Promise.reject(ResCode.UserIdIllegal)
        }

        if (userId){
          sql.user = app.mongoose.Types.ObjectId(userId)
        }

        let missionInfo = await this.findOneById(id)

        if (!missionInfo) {
          return Promise.reject(ResCode.MissionNotFount)
        }

        const projectId = missionInfo.project? missionInfo.project._id: ''

        if (!projectId){
          return Promise.reject(ResCode.ProjectNotFound)
        }

        // 判断项目是否存在
        const projectInfo = await ctx.service.project.findProjectById(projectId)

        if (!projectInfo) {
          return Promise.reject(ResCode.ProjectDontExist)
        }

        // 如果项目存在，则需要判断任务的截止时间不能大于项目的截止时间
        if (deadline && new Date(projectInfo.deadline) < new Date(deadline)) {
          return Promise.reject(ResCode.MissionDeadlineOverProjectDeadline)
        }

        // 找到并且更新
        await app.redis.del(`wb:mission:${id}`)

        const r = await ctx.model.Mission.update({
          _id: id
        }, {
          $set: sql
        })

      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
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
          return Promise.reject(ResCode.MissionIdIllegal)
        }

        // 找到并且更新
        await app.redis.del(`wb:mission:${id}`)

        const result = await ctx.model.Mission.update({
          _id: id
        }, {
          $set: {
            isDelete: true
          }
        })

        if (!result.n) {
          return Promise.reject(ResCode.MissionNotFount)
        }

      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
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
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 查找任务，通过任务id
    async findOneById(id) {
      if (!this.ctx.helper.isObjectId(id)) {
        return Promise.reject(ResCode.MissionIdIllegal)
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
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }


    // 批量更新任务中的部门
    async updateManyDepartment(userId, departmentId) {
      const { ctx } = this
      const x= await ctx.model.Mission.updateMany({
        user: app.mongoose.Types.ObjectId(userId)
      }, {
        $set: {
          department: app.mongoose.Types.ObjectId(departmentId)
        }
      })
    } catch (e) {
      return Promise.reject({
        ...ResCode.Error,
        error: e,
        status: HttpStatus.StatusInternalServerError
      })
    }
  }
  return ProjectService
}
