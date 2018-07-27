const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')
const moment = require('moment')

module.exports = app => {
  class DailytService extends app.Service {
    // 添加任务
    async save() {
      try {
        const { ctx } = this
        const userInfo = ctx.userInfo

        const userId = userInfo._id
        const departmentId = userInfo.department? userInfo.department._id : ''
        const departmentName = userInfo.department? userInfo.department.name : ''

        const requestBody = ctx.request.body

        const {
          record,
          progress,
          missionId,
          eventId
        } = requestBody

        let projectId
        let projectName
        let eventName
        let missionName


        if (!record) {
          return Promise.reject({
            code: ResCode.DailyRecordEmpty
          })
        }

        if (missionId && !ctx.helper.isObjectId(missionId)) {
          return Promise.reject({
            code: ResCode.MissionIdError
          })
        }

        if (eventId && !ctx.helper.isObjectId(eventId)) {
          return Promise.reject({
            code: ResCode.EventIdError
          })
        }

        if (missionId && !progress) {
          return Promise.reject({
            code: ResCode.DailyProgressEmpty
          })
        }

        if (progress && !ctx.helper.isInt(progress) && progress <=100) {
          return Promise.reject({
            code: ResCode.DailyProgressIlligeal
          })
        }

        // 任务id和eventid不能同时存在
        if (eventId && missionId) {
          return Promise.reject({
            code: ResCode.DailyEventAndMissionTogather
          })
        }

        // 任务id和eventid不能同时为空
        if (!eventId && !missionId) {
          return Promise.reject({
            code: ResCode.DailyEventAndMissionAllEmpty
          })
        }

        if (missionId) {
          const missionInfo = await ctx.service.mission.findOneById(missionId)
          // 任务是否存在
          if (!missionInfo) {
            return Promise.reject({
              code: ResCode.MissionNotFount
            })
          }

          const missionByUserId = missionInfo.user ? missionInfo.user._id: ''

          // 如果该任务不属于此用户，则不允许添加
          if (!missionByUserId || userId !== missionByUserId) {
            return Promise.reject({
              code: ResCode.DailyStatusUnauthorized
            })
          }

          const projectInfo = missionInfo.project
          projectId = projectInfo? projectInfo._id : ''
          projectName = projectInfo? projectInfo.name: ''
          missionName = missionInfo.name

          // 判断项目是否存在
          const projectResult = await ctx.service.project.findProjectById(projectId)

          if (!projectResult) {
            return Promise.reject({
              code: ResCode.MissionProjectDontExist
            })
          }
        }


        if (eventId) {
          const eventInfo = await ctx.service.event.findOneById(eventId)

           // 任务是否存在
          if (!eventInfo) {
            return Promise.reject({
              code: ResCode.EventNotFount
            })
          }

          eventName = eventInfo? eventInfo.name: ''
        }

        // 根据当前时间判断判断此用户今天是否有写日报，如果写了则修改，否则创建
        const before = moment().subtract(1, 'day').format('YYYY-MM-DD 23:59:59')
        const after = moment().add(1, 'day').format('YYYY-MM-DD 00:00:00')
        const sql = {
           userId,
          '$and': [{
            'createTime': {
              '$gt': before
            }
          },{
            'createTime': {
              '$lt': after
            }
          }]
        }

        const findTodayDaily = await ctx.model.Daily.findOne(sql)

        if (findTodayDaily) {
          // 批量更新所有进度
          await ctx.model.Daily.update(sql, {
            $set: {
              dailyList: {
                progress
              }
            }
          }, {
            mutil: true
          })

          // 添加新的记录
          await ctx.model.Daily.update({
            userId,
            dailyList: {
              $push: {
                projectId,
                projectName,
                missionName,
                missionId,
                record,
                progress,
                eventId,
                eventName
              }
            }
          })
        }
        else {
          await ctx.model.Daily.create({
            userId,
            departmentId,
            departmentName,
            dailyList:[{
              projectId,
              projectName,
              missionName,
              missionId,
              record,
              progress,
              eventId,
              eventName
            }]
          })
        }
      } catch (e) {
        console.log(e)
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

        // 找到并且更新
        return await ctx.model.Mission.update({
          _id: id
        }, {
          $set: {
            name,
            deadline,
            user: app.mongoose.Types.ObjectId(userId),
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


    // 查询单个任务，包含项目和个人信息
    async findOne() {
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
        let result = await ctx.model.Mission.findOne({
          _id: id,
          isDelete: false
        }).populate({
          path: 'user',
          select: '-updateTime -username -password'
        }).populate({
          path: 'project',
          select: '-missions -isDelete -updateTime'
        })

        return result

      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 获取用户的任务列表
    async findMissions() {
      try {
        const {
          ctx
        } = this
        let { skip = 0, limit = 0, userId } = ctx.query
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
  return DailytService
}
