'use strict';
const ResCode = require('../middleware/responseCode')
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
        ctx.error({
          code: e.code,
          error: e.error
        })
      }
    }

    // 前端获取项目
    //
    async f_list() {
      const { ctx } = this
      try {
        const list = await ctx.service.project.getListByRole()

        ctx.success({
          data: list
        })
      }
      catch (e) {
        ctx.error({
          code: e.code,
          error: e.error
        })
      }
    }

    // 获取单个项目
    async one() {
      const { ctx } = this
      try {
        const result = await ctx.service.project.findProject()
        // const {id, count, name, createTime} = result
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
        ctx.error({
          code: e.code,
          error: e.error
        })
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
        ctx.error({
          code: e.code,
          error: e.error
        })
      }
    }

    // 删除部门，只有放部门人员为0的时候才能删除
    async delete() {
      const { ctx } = this
      try {
        await ctx.service.project.delete()

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
  }
}

