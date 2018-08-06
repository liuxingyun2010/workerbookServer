'use strict';
const ResCode = require('../middleware/responseStatus')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  return class MissionController extends app.Controller {
    // 添加任务
    async add() {
      const { ctx } = this
      try {
        await ctx.service.mission.save()

        ctx.success({
          status: HttpStatus.StatusCreated
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 更新任务
    async update() {
      const { ctx } = this
      try {

        await ctx.service.mission.update()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 删除任务
    async delete() {
      const { ctx } = this
      try {
        await ctx.service.mission.delete()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 获取单个任务
    async one() {
      const { ctx } = this
      try {

        const result = await ctx.service.mission.findOne()

        ctx.success({
          data: result
        })
      }
      catch (e) {
        ctx.error(e)
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
        ctx.error(e)
      }
    }
  }
}

