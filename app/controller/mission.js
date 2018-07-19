'use strict';
const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  return class ProjectController extends app.Controller {
    // 添加任务
    async add() {
      const { ctx } = this
      try {
        // 不是管理员不允许操作
        if (ctx.userInfo.role !== 99) {
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


    // 添加某个人到任务中
    async person() {
      const { ctx } = this
      try {
       // 不是管理员不允许操作
        if (ctx.userInfo.role !== 99) {
          return ctx.error({
            status: HttpStatus.StatusForbidden
          })
        }

        await ctx.service.mission.person()

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

     // 添加某个人到任务中
    async delPerson() {
      const { ctx } = this
      try {
       // 不是管理员不允许操作
        if (ctx.userInfo.role !== 99) {
          return ctx.error({
            status: HttpStatus.StatusForbidden
          })
        }

        await ctx.service.mission.delPerson()

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

