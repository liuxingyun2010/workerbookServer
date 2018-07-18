'use strict';
const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  return class ProjectController extends app.Controller {
    // 获取部门列表
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
          code: e.code
        })
      }
    }

    // 获取单个部门信息
    async one() {
      // const { ctx } = this
      // try {
      //   const result = await ctx.service.project.findProject()
      //   const {id, count, name, createTime} = result
      //   ctx.success({
      //     data: {
      //       id,
      //       count,
      //       name,
      //       createTime
      //     }
      //   })
      // }
      // catch (e) {
      //   ctx.error({
      //     code: e.code
      //   })
      // }
    }

    // 添加部门
    async add() {
      const { ctx } = this
      try {
        // 不是管理员不允许操作
        if (ctx.userInfo.role !== 99) {
          return ctx.error({
            status: HttpStatus.StatusForbidden
          })
        }

        await ctx.service.project.save()

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

    // 修改部门信息，只能修改名称
    async update() {
      const { ctx } = this
      try {
        // 不是管理员不允许操作
        if (ctx.userInfo.role !== 99) {
          return ctx.error({
            status: HttpStatus.StatusForbidden
          })
        }

        await ctx.service.department.update()

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

    // 删除部门，只有放部门人员为0的时候才能删除
    async delete() {
      const { ctx } = this
      try {
       // 不是管理员不允许操作
        if (ctx.userInfo.role !== 99) {
          return ctx.error({
            status: HttpStatus.StatusForbidden
          })
        }

        await ctx.service.department.delete()

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
  }
}

