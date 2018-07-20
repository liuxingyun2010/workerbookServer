'use strict';
const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  return class UserController extends app.Controller {
    // 登录
    async login() {
      const { ctx } = this

      try {
        let userInfo = await ctx.service.user.login()
        const { id } = userInfo

        // 设置 jwt
        const token = app.jwt.sign({
          id
        }, app.config.jwt.secret)

        ctx.success({
          data: {
            token: token
          }
        })
      } catch (e) {
        ctx.error({
          code: e.code
        })
      }
    }

    // 获取个人信息
    async profile() {
      const { ctx } = this
      try {
        const {
          _id,
          username,
          nickname,
          role,
          status,
          department: {
            _id: departmentId,
            name: departmentName
          } = {
            _id: "",
            name: ""
          }
        } = ctx.userInfo

        ctx.success({
          data: {
            id:_id,
            username,
            nickname,
            role,
            status,
            department: {
              id: departmentId,
              name: departmentName
            }
          }
        })
      }
      catch(e) {
        ctx.error({
          code: e.code
        })
      }
    }

    // 添加用户
    async add() {
      const { ctx } = this
      try {
        // 不是管理员不允许操作
        if (ctx.userInfo.role !== 99) {
          return ctx.error({
            status: HttpStatus.StatusForbidden
          })
        }

        await ctx.service.user.insertUser()

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

    // 编辑用户
    async edit() {
      const { ctx } = this
      try {
        // 不是管理员不允许操作
        if (ctx.userInfo.role !== 99) {
          return ctx.error({
            status: HttpStatus.StatusForbidden
          })
        }

        await ctx.service.user.updateUser()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      } catch (e) {
         ctx.error({
          code: e.code
        })
      }
    }

    // 停用或者启用用户
    async delete() {
      const { ctx } = this
      try {
        // 不是管理员不允许操作
        if (ctx.userInfo.role !== 99) {
          return ctx.error({
            status: HttpStatus.StatusForbidden
          })
        }

        await ctx.service.user.deleteUser()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      } catch (e) {
         ctx.error({
          code: e.code
        })
      }
    }

    // 获取单个用户
    async getUser() {
      const { ctx } = this
      try {
        const id = this.ctx.params.id

        const userInfo = await ctx.service.user.findUserById(id)
        if (!userInfo) {
          return ctx.error({
            code: ResCode.UserNotFound
          })
        }

        const {
          _id,
          username,
          nickname,
          role,
          title,
          department: {
            _id: departmentId,
            name: departmentName
          } = {
            _id: "",
            name: ""
          }
        } = userInfo

        ctx.success({
          data: {
            id:_id,
            username,
            nickname,
            role,
            title,
            department: {
              id: departmentId,
              name: departmentName
            }
          }
        })
      }
      catch(e) {
        ctx.error({
          code: e.code
        })
      }
    }

    // 获取所有列表
    async list() {
      const { ctx } = this
      try {
        const result = await ctx.service.user.findUserList()
        ctx.success({
          data: result
        })
      }
      catch(e) {
        ctx.error({
          code: e.code
        })
      }
    }


    // 修改密码
    async editPwd() {
      const { ctx } = this
      try {
        // 不是管理员不允许操作
        if (ctx.userInfo.role !== 99) {
          return ctx.error({
            status: HttpStatus.StatusForbidden
          })
        }

        await ctx.service.user.updatePwd()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      } catch (e) {
         ctx.error({
          code: e.code
        })
      }
    }


    // 重置密码
    async resetPwd() {
      const { ctx } = this
      try {
        // 不是管理员不允许操作
        if (ctx.userInfo.role !== 99) {
          return ctx.error({
            status: HttpStatus.StatusForbidden
          })
        }

        await ctx.service.user.resetPassword()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      } catch (e) {
         ctx.error({
          code: e.code
        })
      }
    }

  }
}
