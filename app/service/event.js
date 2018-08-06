const ResCode = require('../middleware/responseStatus')
const HttpStatus = require('../middleware/httpStatus')
const moment = require('moment')

module.exports = app => {
  class EventService extends app.Service {
    // 添加任务
    async save() {
      try {
        const {
          ctx
        } = this

        const requestBody = ctx.request.body
        const {
          name
        } = requestBody


        if (!name) {
          return Promise.reject(ResCode.EventNameNotFound)
        }

        // 判断日程是否已经存在
        const eventInfo = await ctx.model.Event.findOne({
          name
        })

        if (eventInfo) {
          return Promise.reject(ResCode.EventNameExist)
        }

        return await ctx.model.Event.create({
          name
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
          name
        } = requestBody

        if (!name) {
          return Promise.reject(ResCode.EventNameNotFound)
        }

        // 判断日程是否已经存在
        const eventInfo = await ctx.model.Event.findOne({
          name
        })

        if (eventInfo) {
          return Promise.reject(ResCode.EventNameExist)
        }

        // 找到并且更新
        return await ctx.model.Event.update({
          _id: id
        }, {
          $set: {
            name
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

    // 删除任务
    async delete() {
      try {
        const {
          ctx
        } = this
        const id = ctx.params.id

        if (!this.ctx.helper.isObjectId(id)) {
          return Promise.reject(ResCode.EventIdIllegal)
        }

        // 找到并且更新
        const result = await ctx.model.Event.update({
          _id: id
        }, {
          $set: {
            isDelete: true
          }
        })

        if (!result.n) {
          return Promise.reject(ResCode.EventNotFound)
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
          code: ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }


    // 查找任务，通过任务id
    async findOneById(id) {
      if (!this.ctx.helper.isObjectId(id)) {
        return Promise.reject(ResCode.EventIdIllegal)
      }

      const result = await app.redis.get(`wb:event:${id}`)
      if (result) {
        return JSON.parse(result)
      }

      let info = await this.ctx.model.Event.findOne({
        _id: app.mongoose.Types.ObjectId(id),
        isDelete: false
      }, '-updateTime -isDelete')

      if (info) {
        await app.redis.set(`wb:event:${id}`, JSON.stringify(info))
      }

      return info
    }

    // 获取用户的任务列表
    async findEvents() {
      try {
        const {
          ctx
        } = this

        let {
          skip = 0, limit = 0, userId
        } = ctx.query


        let result = {}

        let params = {
          isDelete: false,
          status: 1,
        }

        skip = Number(skip)
        limit = Number(limit)

        const list = await ctx.model.Event.find(params, '-updateTime -isDelete').skip(skip).limit(limit)
        const count = await ctx.model.Mission.find(params).skip(skip).limit(limit).count()

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
  }
  return EventService
}
