'use strict';
const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  return class EventController extends app.Controller {
    // 添加任务
    async add() {
      const { ctx } = this
      try {
        await ctx.service.event.save()

        ctx.success({
          status: HttpStatus.StatusCreated
        })
      }
      catch (e) {
        ctx.error({
          code: e.code,
          error: e.error
        })
      }
    }

    // 更新任务
    async update() {
      const { ctx } = this
      try {

        await ctx.service.event.update()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      }
      catch (e) {
        ctx.error({
          code: e.code,
          error: e.error
        })
      }
    }

    // 删除任务
    async delete() {
      const { ctx } = this
      try {
        await ctx.service.event.delete()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      }
      catch (e) {
        ctx.error({
          code: e.code,
          error: e.error
        })
      }
    }


    async one() {
      const { ctx } = this
      try {

        const result = await ctx.service.event.findOne()

        ctx.success({
          data: result
        })
      }
      catch (e) {
        ctx.error({
          code: e.code,
          error: e.error
        })
      }
    }


    // 我的任务列表
    async list() {
      const { ctx } = this
      try {

        const result = await ctx.service.event.findEvents()

        ctx.success({
          data: result
        })
      }
      catch (e) {
        ctx.error({
          code: e.code,
          error: e.error
        })
      }
    }
  }
}

