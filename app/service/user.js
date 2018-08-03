const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')

const md5 = require('md5')

module.exports = app => {
  class UserService extends app.Service {
    async login() {
      try {
        const {
          ctx
        } = this

        const requestBody = ctx.request.body

        if (!requestBody) {
          return Promise.reject({
            code: ResCode.AccountPwEmpty
          })
        }

        const {
          username,
          password
        } = requestBody

        if (!username) {
          return Promise.reject({
            code: ResCode.AccountEmpty
          })
        }

        if (!password) {
          return Promise.reject({
            code: ResCode.PwEmpty
          })
        }

        // 查找用户，第一步验证用户名
        const findUser = await this.findUserByUsernameAndPw({
          username,
          password: md5(password),
          isDelete: false
        })

        if (!findUser) {
          return Promise.reject({
            code: ResCode.AccountPwError
          })
        }

        return findUser

      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 通过用户名和密码查询用户
    async findUserByUsernameAndPw(params) {
      const userInfo = await this.ctx.model.User.findOne(params, 'id')
      return userInfo
    }

    // 通过不同的条件获取用户信息
    async findUserById(id) {
      try {
        if (!id) {
          return Promise.reject({
            code: ResCode.AccountIdEmpty
          })
        }

        const userInfo = await app.redis.get(`wb:user:${id}`)
        if (userInfo) {
          return JSON.parse(userInfo)
        }

        if (!this.ctx.helper.isObjectId(id)) {
          return Promise.reject({
            code: ResCode.UserIdIlligal
          })
        }

        const findUser = await this.ctx.model.User.findOne({
          _id: id
        }).populate({
          path: 'department',
          select: {
            name: 1,
            _id: 1
          }
        })

        if (findUser) {
          await app.redis.set(`wb:user:${id}`, JSON.stringify(findUser))
        }

        return findUser
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    async insertUser() {
      try {
        const {
          ctx
        } = this
        const requestBody = ctx.request.body

        if (!requestBody) {
          return Promise.reject({
            code: ResCode.AccountInfoEmpty
          })
        }
        const {
          username,
          password,
          nickname,
          departmentId,
          mobile,
          email,
          role,
          title
        } = requestBody

        if (!username) {
          return Promise.reject({
            code: ResCode.AccountPwEmpty
          })
        }

        if (!password) {
          return Promise.reject({
            code: ResCode.PwEmpty
          })
        }

        if (!nickname) {
          return Promise.reject({
            code: ResCode.NicknameEmpty
          })
        }

        if (!departmentId) {
          return Promise.reject({
            code: ResCode.DepartmentEmpty
          })
        }

        if (!role) {
          return Promise.reject({
            code: ResCode.RoleEmpty
          })
        }

        if (!title) {
          return Promise.reject({
            code: ResCode.TitleEmpty
          })
        }

        // 查找用户，第一步验证用户名
        const findUser = await ctx.model.User.findOne({
          username
        })

        if (findUser) {
          return Promise.reject({
            code: ResCode.UserExist
          })
        }

        const userInfo = await ctx.model.User.create({
          username,
          password: md5(password),
          nickname,
          department: app.mongoose.Types.ObjectId(departmentId),
          mobile,
          email,
          title,
          role
        })

        this.calcMemberCount([departmentId])

        return userInfo

      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 更新用户
    async updateUser() {
      try {
        const {
          ctx
        } = this
        const id = ctx.params.id
        const requestBody = ctx.request.body

        if (!requestBody) {
          return Promise.reject({
            code: ResCode.AccountInfoEmpty
          })
        }

        const {
          nickname,
          departmentId,
          mobile,
          email,
          role,
          title,
          status
        } = requestBody


        if (!nickname) {
          return Promise.reject({
            code: ResCode.NicknameEmpty
          })
        }

        if (!departmentId) {
          return Promise.reject({
            code: ResCode.DepartmentEmpty
          })
        }

        if (!ctx.helper.isObjectId(departmentId)) {
          return Promise.reject({
            code: ResCode.DepartmentIdError
          })
        }

        if (!role) {
          return Promise.reject({
            code: ResCode.RoleEmpty
          })
        }

        if (!title) {
          return Promise.reject({
            code: ResCode.TitleEmpty
          })
        }

        if (!ctx.helper.isObjectId(id)) {
          return Promise.reject({
            code: ResCode.UserIdIlligal
          })
        }

        if (!status) {
          return Promise.reject({
            code: ResCode.UserStatusEmpty
          })
        }

        const user = await this.findUserById(id)
        if (!user) {
          return Promise.reject({
            code: ResCode.UserNotFound
          })
        }

        // 查找用户并更新
        const result = await ctx.model.User.findOneAndUpdate({
          _id: id
        }, {
          $set: {
            nickname,
            department: app.mongoose.Types.ObjectId(departmentId),
            mobile,
            email,
            role,
            title,
            status
          }
        },{new: true})

        if (!result) {
          return Promise.reject({
            code: ResCode.UserNotFound
          })
        }

        await app.redis.del(`wb:user:${id}`)

        // 动态计算所有
        if (String(user.department._id) !== String(departmentId)) {
          this.calcMemberCount([user.department._id, departmentId])
        }
      }
      catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 删除用户
    async deleteUser() {
      try {
        const {
          ctx
        } = this
        const id = ctx.params.id

        if (!ctx.helper.isObjectId(id)) {
          return Promise.reject({
            code: ResCode.UserIdIlligal
          })
        }

        // 查找用户并更新
        const result = await ctx.model.User.findOneAndUpdate({
          _id: id
        }, {
          $set: {
            isDelete: true
          }
        },{new: true})

        if (!result) {
          return Promise.reject({
            code: ResCode.UserNotFound
          })
        }

        await app.redis.del(`wb:user:${id}`)

        // 更新用户
        this.calcMemberCount([result.department])
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 分页查找数据
    async findUserList() {
      try {
        const { ctx } = this

        // 过滤掉管理员
        const params = {
          role: {$ne: 99},
          isDelete: false
        }

        let result = {}

        let { skip = 0, limit = 0, departments } = ctx.query
        skip = Number(skip)
        limit = Number(limit)

        // 逗号隔开
        if (departments) {
          let ds = departments.split(',')
          ds = ds.map(item => {
            return app.mongoose.Types.ObjectId(item)
          })

          params.department = {
            $in: ds
          }
        }

        const count = await ctx.model.User.find(params).skip(skip).limit(limit).count()

        // 查找用户并更新
        const list = await ctx.model.User.find(params, '-isDelete -updateTime -password').skip(skip).limit(limit).populate({
          path: 'department',
          select: {
            name: 1,
            _id: 1
          }
        })

        result.count = count
        result.list = list

        if(limit) {
          result.limit = limit
          result.skip = skip
        }

        return result
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    async updatePwd() {
      try {
        const { ctx } = this
        const id = ctx.params.id
        const requestBody = ctx.request.body

        const {
          password,
          newPassword
        } = requestBody


        if (!password) {
          return Promise.reject({
            code: ResCode.PwEmpty
          })
        }

        if (!newPassword) {
          return Promise.reject({
            code: ResCode.NewPwEmpty
          })
        }

        if (!ctx.helper.isObjectId(id)) {
          return Promise.reject({
            code: ResCode.UserIdIlligal
          })
        }

        const findOne = await this.findUserByUsernameAndPw({
          _id: id,
          password: md5(password)
        })

        if (!findOne) {
          return Promise.reject({
            code: ResCode.PwError
          })
        }

        // 查找用户并更新
        const result = await ctx.model.User.update({
          _id: id,
          password: md5(password)
        }, {
          $set: {
            password: md5(newPassword)
          }
        })

        // 更新成功则删除redis
        if (result.n) {
          await app.redis.del(`wb:user:${id}`)
        }

      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    async resetPassword() {
      try {
        const { ctx } = this
        const id = ctx.params.id
        const requestBody = ctx.request.body
        const { newPassword } = requestBody

        if (!newPassword) {
          return Promise.reject({
            code: ResCode.NewPwEmpty
          })
        }

        if (!ctx.helper.isObjectId(id)) {
          return Promise.reject({
            code: ResCode.UserIdIlligal
          })
        }

        const findOne = await this.findUserById(id)

        if (!findOne) {
          return Promise.reject({
            code: ResCode.UserNotFound
          })
        }

        // 查找用户并更新
        const result = await ctx.model.User.update({
          _id: id
        }, {
          $set: {
            password: md5(newPassword)
          }
        })

        // 更新成功则删除redis
        if (result.n) {
          await app.redis.del(`wb:user:${id}`)
        }

      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    async calcMemberCount(list) {
      try {
        list.forEach(async (item, index) => {
          const id = app.mongoose.Types.ObjectId(item)

          const count = await this.ctx.model.User.find({
            department: id,
            isDelete: false
          }).count()

          await this.ctx.model.Department.update({
            _id: id
          }, {
            $set: {
              count: count
            }
          })
        })
      }
      catch(e) {
        return Promise.reject({
          code: ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }
  }
  return UserService
}
