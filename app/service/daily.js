const ResCode = require('../middleware/responseStatus')
const HttpStatus = require('../middleware/httpStatus')
const moment = require('moment')

module.exports = app => {
  class DailytService extends app.Service {
    // 添加日报
    async save() {
      try {
        const { ctx } = this
        const userInfo = ctx.userInfo
        const userId = userInfo._id
        const departmentId = userInfo.department ? userInfo.department._id : ''
        const departmentName = userInfo.department ? userInfo.department.name : ''
        const requestBody = ctx.request.body

        const {
          record,
          progress,
          missionId,
          eventId,
        } = requestBody

        let projectId
        let projectName
        let eventName
        let missionName


        if (!record) {
          return Promise.reject(ResCode.DailyRecordNotFound)
        }

        if (missionId && !ctx.helper.isObjectId(missionId)) {
          return Promise.reject(ResCode.MissionIdIllegal)
        }

        if (eventId && !ctx.helper.isObjectId(eventId)) {
          return Promise.reject({
            code: ResCode.EventIdError,
          })
        }

        if (progress && !ctx.helper.isInt(progress) && progress <= 100) {
          return Promise.reject(ResCode.DailyProgressIllegal)
        }

        // 任务id和eventid不能同时存在
        if (eventId && missionId) {
          return Promise.reject(ResCode.DailyHasEventAndMission)
        }

        // 任务id和eventid不能同时为空
        if (!eventId && !missionId) {
          return Promise.reject(ResCode.DailyNoEventAndMission)
        }

        if (missionId) {
          const missionInfo = await ctx.service.mission.findOneById(missionId)
          // 任务是否存在
          if (!missionInfo) {
            return Promise.reject(ResCode.MissionNotFound)
          }

          const missionByUserId = missionInfo.user ? missionInfo.user._id : ''

          // 如果该任务不属于此用户，则不允许添加
          if (!missionByUserId || String(userId) !== String(missionByUserId)) {
            return Promise.reject(ResCode.DailyStatusUnauthorized)
          }

          const projectInfo = missionInfo.project
          projectId = projectInfo ? projectInfo._id : ''
          projectName = projectInfo ? projectInfo.name : ''
          missionName = missionInfo.name

          // 判断项目是否存在
          const projectResult = await ctx.service.project.findProjectById(projectId)

          if (!projectResult) {
            return Promise.reject(ResCode.ProjectNotFound)
          }
        }


        if (eventId) {
          const eventInfo = await ctx.service.event.findOneById(eventId)

          // 任务是否存在
          if (!eventInfo) {
            return Promise.reject(ResCode.EventNotFound)
          }

          eventName = eventInfo ? eventInfo.name : ''
        }

        // 根据当前时间判断判断此用户今天是否有写日报，如果写了则修改，否则创建
        const date = moment().format('YYYY-MM-DD')

        const sql = {
          userId,
          date
        }

        const findTodayDaily = await ctx.model.Daily.findOne(sql)

        if (findTodayDaily) {
          const dailyList = findTodayDaily.dailyList
          if (missionId) {
            dailyList.forEach(async (item, index) => {
              if (String(item.missionId) === String(missionId)) {
                dailyList[index].progress = progress
              }
            })
            await ctx.model.Daily.update(sql, {
              $set: {
                dailyList,
              },
            })
          }

          // 添加新的记录
          await ctx.model.Daily.update(sql, {
            $push: {
              dailyList: {
                projectId,
                projectName,
                missionName,
                missionId,
                record,
                progress,
                eventId,
                eventName,
              },
            },
          })
        } else {
          await ctx.model.Daily.create({
            userId,
            departmentId,
            departmentName,
            date,
            nickname: ctx.userInfo.nickname ||'',
            dailyList: [{
              projectId,
              projectName,
              missionName,
              missionId,
              record,
              progress,
              eventId,
              eventName,
            }],
          })
        }

        if (missionId) {
          // 同步任务进度到任务列表
          await ctx.service.mission.updateProgress({
            progress,
            missionId,
          })

          // 同步进度到统计表
          const analysisInfo = await ctx.model.Analysis.findOne({
            date,
            missionId
          })

          if (analysisInfo) {
            await ctx.model.Analysis.update({
              progress
            })
          }
          else {
            await ctx.model.Analysis.create({
              progress,
              missionId,
              date
            })
          }
        }

      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError,
        })
      }
    }

    // 更新日报
    async update() {
      try {
        const {
          ctx,
        } = this
        const id = ctx.params.id
        const requestBody = ctx.request.body

        const {
          record,
        } = requestBody

        if (!record) {
          return Promise.reject(ResCode.DailyRecordNotFound)
        }

        if (!ctx.helper.isObjectId(id)) {
          return Promise.reject(ResCode.DailyIdIllegal)
        }

        const daily = await ctx.model.Daily.findOne({
          'dailyList._id': id,
        })

        if (!daily) {
          return Promise.reject(ResCode.DailyNotFound)
        }

        // 如果该任务不属于此用户，则不允许添加
        if (String(ctx.userInfo._id) !== String(daily.userId)) {
          return Promise.reject(ResCode.DailyStatusUnauthorized,)
        }

        // 找到并且更新
        return await ctx.model.Daily.update({
          'dailyList._id': id,
        }, {
          $set: {
            'dailyList.$.record': record,
          },
        })
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError,
        })
      }
    }

    // 删除日报
    async delete() {
      try {
        const {
          ctx,
        } = this
        const id = ctx.params.id

        if (!ctx.helper.isObjectId(id)) {
          return Promise.reject(ResCode.DailyIdIllegal)
        }

        const daily = await ctx.model.Daily.findOne({
          'dailyList._id': id,
        })

        if (!daily) {
          return Promise.reject(ResCode.DailyNotFound)
        }

        // 如果该任务不属于此用户，则不允许添加
        if (String(ctx.userInfo._id) !== String(daily.userId)) {
          return Promise.reject(ResCode.DailyStatusUnauthorized)
        }

        // 找到当前的missionId 或者是eventId
        const singleDaily = daily.dailyList.find(item => {
          return String(item._id) === String(id)
        })

        if (!singleDaily){
          return Promise.reject(ResCode.DailyNotFound)
        }

        const missionOrEventId = singleDaily.missionId || singleDaily.eventId
        const type = singleDaily.missionId ? 'mission' : 'event'

        // 删除
        const result = await ctx.model.Daily.update({
          'dailyList._id': id,
        }, {
          $pull: {
            dailyList: {
              _id: id,
            },
          }
        })

        // 当前删除的是否是此任务在今天的最后一条数据，如果是，则需要把任务的进度更新到昨天
        const date = moment().format('YYYY-MM-DD')
        const userId = ctx.userInfo._id
        const sql = {
          userId,
          date
        }

        const list = await ctx.model.Daily.findOne(sql)
        if (!list || list.dailyList.length === 0) {
          // 删掉此条日报
          const ds = await ctx.model.Daily.remove({
            userId,
            date
          })

          if (type === 'mission') {
            await ctx.model.Analysis.findOne({

            })
            // 更新进度为昨天的进度
            await ctx.service.mission.updateProgress({
              missionId,
              progress: 100,
            })

            // 删除统计表中的当天的记录
            await ctx.model.Analysis.remove({
              date,
              missionId
            })
          }
        }
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError,
        })
      }
    }

    // 获取日报列表
    async getList() {
      try {
        const {
          ctx,
        } = this

        let {
          skip = 0, limit = 0, userId, date, departmentId,
        } = ctx.query

        skip = Number(skip)
        limit = Number(limit)

        if (userId && !ctx.helper.isObjectId(userId)){
          return Promise.reject(ResCode.UserIdIllegal)
        }

        if (departmentId && !ctx.helper.isObjectId(departmentId)){
          return Promise.reject(RecCode.DepartmentIdIllegal)
        }

        const currentDate = date || moment().format('YYYY-MM-DD')

        const sql = {
          date: currentDate
        }

        if (userId) {
          sql.userId = userId
        }

        if (departmentId) {
          sql.departmentId = departmentId
        }

        const result = {}
        const list = await ctx.model.Daily.find(sql, '-createTime').skip(skip).limit(limit)


        const count = await ctx.model.Daily.find(sql).count()

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
          status: HttpStatus.StatusInternalServerError,
        })
      }
    }

    // 获取今天的日报
    async getMeToday() {
      try {
        const {
          ctx,
        } = this

        const id = ctx.userInfo._id

        if (id && !ctx.helper.isObjectId(id)){
          return Promise.reject(ResCode.UserIdIllegal)
        }

        const currentDate = moment().format('YYYY-MM-DD')

        const sql = {
          date: currentDate,
          userId: id
        }

        const result = await ctx.model.Daily.findOne(sql)

        return result? result.dailyList : []
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError,
        })
      }
    }
  }
  return DailytService
}
