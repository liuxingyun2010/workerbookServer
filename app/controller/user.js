'use strict';
const ResCode = require('../middleware/responseStatus')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  return class UserController extends app.Controller {
    // 登录
    async login() {
      const {
        ctx
      } = this

      try {
        const userInfo = await ctx.service.user.login()
        const {
          id
        } = userInfo

        // 设置 jwt
        const token = app.jwt.sign({
          id
        }, app.config.jwt.secret, {
          expiresIn: 60 * 60 * 24 * 365
        })

        ctx.success({
          data: {
            token: token
          }
        })
      } catch (e) {
        ctx.error(e)
      }
    }

    // 获取个人信息
    async profile() {
      const {
        ctx
      } = this
      try {
        const {
          _id,
          username,
          nickname,
          role,
          status
        } = ctx.userInfo

        let departmentId = ''
        let departmentName = ''

        // 因为管理员是没有部门数据的
        if (role !== 99) {
          departmentId = ctx.userInfo.department ? ctx.userInfo.department._id : ''
          departmentName = ctx.userInfo.department ? ctx.userInfo.department.name : ''
        }

        ctx.success({
          data: {
            id: _id,
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
      } catch (e) {
        ctx.error(e)
      }
    }

    // 添加用户
    async add() {
      const {
        ctx
      } = this
      try {
        await ctx.service.user.insertUser()
        ctx.success({
          status: HttpStatus.StatusCreated
        })
      } catch (e) {
        ctx.error(e)
      }
    }

    // 编辑用户
    async edit() {
      const {
        ctx
      } = this
      try {
        await ctx.service.user.updateUser()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      } catch (e) {
        ctx.error(e)
      }
    }

    // 停用或者启用用户
    async delete() {
      const {
        ctx
      } = this
      try {
        await ctx.service.user.deleteUser()

        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      } catch (e) {
        ctx.error(e)
      }
    }

    // 获取单个用户
    async getUser() {
      const {
        ctx
      } = this
      try {
        const userInfo = await ctx.service.user.getOneUser()

        const {
          _id,
          username,
          nickname,
          role,
          title,
          status,
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
            id: _id,
            username,
            nickname,
            role,
            title,
            status,
            department: {
              id: departmentId,
              name: departmentName
            }
          }
        })
      } catch (e) {
        ctx.error(e)
      }
    }

    // 获取所有列表， 管理后台
    async list() {
      const {
        ctx
      } = this
      try {
        const result = await ctx.service.user.findUserList()
        ctx.success({
          data: result
        })
      } catch (e) {
        ctx.error(e)
      }
    }

    // 获取所有列表， 前端
    async f_list() {
      const {
        ctx
      } = this
      try {
        const result = await ctx.service.user.f_findUserList()
        ctx.success({
          data: result
        })
      } catch (e) {
        ctx.error(e)
      }
    }

    // 修改密码
    async editPwd() {
      const {
        ctx
      } = this
      try {
        await ctx.service.user.updatePwd()
        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      } catch (e) {
        ctx.error(e)
      }
    }

    // 重置密码
    async resetPwd() {
      const {
        ctx
      } = this
      try {
        await ctx.service.user.resetPassword()
        ctx.success({
          status: HttpStatus.StatusNoContent
        })
      } catch (e) {
        ctx.error(e)
      }
    }
  }
}
