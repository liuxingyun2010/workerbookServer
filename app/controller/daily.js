'use strict';
const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  return class DailyController extends app.Controller {
    // 添加任务
    async add() {
      const { ctx } = this
      try {
        // 不是管理员和了leader不允许操作
        if (ctx.userInfo.role !== 99 && ctx.userInfo.role !== 2) {
          return ctx.error({
            status: HttpStatus.StatusForbidden
          })
        }

        await ctx.service.mission.save()

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

    // 更新任务
    async update() {
      const { ctx } = this
      try {
        // 不是管理员和了leader不允许操作
        if (ctx.userInfo.role !== 99 && ctx.userInfo.role !== 2) {
          return ctx.error({
            status: HttpStatus.StatusForbidden
          })
        }

        await ctx.service.mission.update()

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

    // 删除任务
    async delete() {
      const { ctx } = this
      try {
        // 不是管理员和了leader不允许操作
        if (ctx.userInfo.role !== 99 && ctx.userInfo.role !== 2) {
          return ctx.error({
            status: HttpStatus.StatusForbidden
          })
        }

        await ctx.service.mission.delete()

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


    async one() {
      const { ctx } = this
      try {

        const result = await ctx.service.mission.findOne()

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


    // 我的任务列表
    async myMissions() {
      const { ctx } = this
      try {

        const result = await ctx.service.mission.findMissions()

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

