'use strict';
const ResCode = require('../middleware/responseStatus')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  return class EventController extends app.Controller {
    // 添加日程
    async add() {
      const { ctx } = this
      try {
        await ctx.service.event.save()

        ctx.success({
          status: HttpStatus.StatusCreated
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 更新日程
    async update() {
      const { ctx } = this
      try {

        await ctx.service.event.update()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 删除日程
    async delete() {
      const { ctx } = this
      try {
        await ctx.service.event.delete()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 获取单个日程
    async one() {
      const { ctx } = this
      try {

        const result = await ctx.service.event.findOne()

        ctx.success({
          data: result
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }


    // 我的日程列表
    async list() {
      const { ctx } = this
      try {
        const result = await ctx.service.event.findEvents()
        ctx.success({
          data: result
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }
  }
}

