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
          uid
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

        if (!ctx.helper.isObjectId(uid)) {
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
          user: app.mongoose.Types.ObjectId(uid)
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
          projectId,
          uid
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

        if (!ctx.helper.isObjectId(uid)) {
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

        // 找到并且更新
        return await ctx.model.Mission.update({
          _id: id
        }, {
          $set: {
            name,
            deadline,
            uid
          }
        })
      } catch (e) {
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
  }
  return ProjectService
}
