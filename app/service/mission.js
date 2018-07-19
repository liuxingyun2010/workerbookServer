const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  class ProjectService extends app.Service {
    // 将人员添加至任务
    async person() {
      try {
        const { ctx } = this
        const id = ctx.params.id
        const uid = ctx.params.uid
        const requestBody = ctx.request.body
        const { day } = requestBody
        if (!ctx.helper.isObjectId(uid)) {
          return Promise.reject({
            code: ResCode.UserIdIlligal
          })
        }

        if (!day) {
          return Promise.reject({
            code: ResCode.MissionDayNoFound
          })
        }

        if (!ctx.helper.isObjectId(id)) {
          return Promise.reject({
            code: ResCode.MissionIdError
          })
        }

        // 判断项目是否存在
        const missionInfo = await this.findMissionById(id)

        if (!missionInfo) {
          return Promise.reject({
            code: ResCode.MissionNotFount
          })
        }

        // 判断新添加的用户是否已经在项目里面
        // 并且不是已经删除的用户
        const findPerson = await ctx.model.Mission.findOne({
          _id: id,
          'users.info': uid
        })


        let result = null

        if (findPerson) {
          result = await ctx.model.Mission.findOneAndUpdate({
            _id: id,
            'users.info': uid
          }, {
            $set: {
              'users.$.day': day
            }
          },{new: true})
        } else {
          result = await ctx.model.Mission.findOneAndUpdate({
            _id: id
          }, {
            $addToSet: {
              users: {
                info: uid,
                day
              }
            }
          },{new: true})
        }

        // 更新完成之后，重新写入redis
        if (result) {
          await app.redis.set(`wb:mission:${id}`, JSON.stringify(result))
        }
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 将人员从任务删除
    async delPerson() {
      try {
        const { ctx } = this
        const id = ctx.params.id
        const uid = ctx.params.uid
        if (!ctx.helper.isObjectId(uid)) {
          return Promise.reject({
            code: ResCode.UserIdIlligal
          })
        }

        if (!ctx.helper.isObjectId(id)) {
          return Promise.reject({
            code: ResCode.MissionIdError
          })
        }

        const result = await ctx.model.Mission.findOneAndUpdate({
          _id: id
        }, {
          $pull: {
            users: {
              info: uid
            }
          }
        },{new: true})

        // 更新完成之后，重新写入redis
        if (result) {
          await app.redis.del(`wb:mission:${id}`, JSON.stringify(result))
        }
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

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
          description = '',
        } = requestBody


        if (!name) {
          return Promise.reject({
            code: ResCode.MissionNameEmpty
          })
        }

        if (!projectId) {
          return Promise.reject({
            code: ResCode.MissionProjectIdEmpty
          })
        }

        if (!ctx.helper.isObjectId(projectId)) {
          return Promise.reject({
            code: ResCode.MissionProjectIdError
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
          description
        })


        const missionId = missionResult._id
        if (missionId) {
          await ctx.service.project.addMission(projectId, missionId)
        }
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 查找单个任务
    async findMissionById(id) {
      const result = await app.redis.get(`wb:mission:${id}`)

      if (result) {
        return JSON.parse(result)
      }

      const project = await this.ctx.model.Mission.findOne({
        _id: id
      })

      if (project) {
        await app.redis.set(`wb:mission:${id}`, JSON.stringify(project))
      }

      return project
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
          description = '',
        } = requestBody

        if (!name) {
          return Promise.reject({
            code: ResCode.MissionNameEmpty
          })
        }

        if (!projectId) {
          return Promise.reject({
            code: ResCode.MissionProjectIdEmpty
          })
        }

        if (!ctx.helper.isObjectId(projectId)) {
          return Promise.reject({
            code: ResCode.MissionProjectIdError
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
            description
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
