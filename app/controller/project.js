'use strict';
const ResCode = require('../middleware/responseStatus')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  return class ProjectController extends app.Controller {
    // 获取项目列表
    async list() {
      const { ctx } = this
      try {
        const list = await ctx.service.project.getList()

        ctx.success({
          data: list
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 前端获取项目
    async f_list() {
      const { ctx } = this
      try {
        const list = await ctx.service.project.getListByRole()

        ctx.success({
          data: list
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 获取单个项目
    async one() {
      const { ctx } = this
      try {
        const result = await ctx.service.project.findProject()
        ctx.success({
          data: result
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 添加项目
    async add() {
      const { ctx } = this
      try {

        await ctx.service.project.save()

        ctx.success({
          status: HttpStatus.StatusCreated
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 修改项目
    async update() {
      const { ctx } = this
      try {

        await ctx.service.project.update()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 删除项目
    async delete() {
      const { ctx } = this
      try {
        await ctx.service.project.delete()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }
  }
}

