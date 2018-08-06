'use strict';
const ResCode = require('../middleware/responseStatus')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  return class DepartmentController extends app.Controller {
    // 获取部门列表
    async list() {
      const { ctx } = this
      try {
        const list = await ctx.service.department.getDepartmentList()
        ctx.success({
          data: list
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 获取部门列表,前端
    async f_list() {
      const { ctx } = this
      try {
        const list = await ctx.service.department.getDepartmentList()
        ctx.success({
          data: list
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 获取单个部门信息
    async findOne() {
      const { ctx } = this
      try {
        const result = await ctx.service.department.findOneDepartment()
        const {id, count, name, createTime} = result
        ctx.success({
          data: {
            id,
            count,
            name,
            createTime
          }
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 添加部门
    async add() {
      const { ctx } = this
      try {
        await ctx.service.department.save()
        ctx.success({
          status: HttpStatus.StatusCreated
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 修改部门信息，只能修改名称
    async update() {
      const { ctx } = this
      try {
        await ctx.service.department.update()
        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 删除部门，只有放部门人员为0的时候才能删除
    async delete() {
      const { ctx } = this
      try {
        await ctx.service.department.delete()
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

