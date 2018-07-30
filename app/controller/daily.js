'use strict';
const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  return class DailyController extends app.Controller {
    // 添加日报
    async add() {
      const { ctx } = this
      try {
        await ctx.service.daily.save()

        ctx.success({
          status: HttpStatus.StatusCreated
        })
      }
      catch (e) {
        ctx.error({
          code: e.code
        })
      }
    }

    // 更新日报
    async update() {
      const { ctx } = this
      try {
        await ctx.service.daily.update()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      }
      catch (e) {
        ctx.error({
          code: e.code
        })
      }
    }

    // 删除日报
    async delete() {
      const { ctx } = this
      try {

        await ctx.service.daily.delete()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      }
      catch (e) {
        ctx.error({
          code: e.code
        })
      }
    }

    // 我的任务列表
    async list() {
      const { ctx } = this
      try {
        const result = await ctx.service.daily.getList()
        ctx.success({
          data: result
        })
      }
      catch (e) {
        ctx.error({
          code: e.code
        })
      }
    }
  }
}

