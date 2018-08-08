const ResCode = require('../middleware/responseStatus')
const HttpStatus = require('../middleware/httpStatus')
const md5 = require('md5')

module.exports = app => {
  class UserService extends app.Service {
    // 登录
    async login() {
      try {
        const {
          ctx
        } = this

        const requestBody = ctx.request.body
        const { username, password } = requestBody

        if (!username) {
          return Promise.reject(ResCode.UserAccountNotFound)
        }

        if (!password) {
          return Promise.reject(ResCode.UserPasswordNotFound)
        }
        // 查找用户，第一步验证用户名
        const findUser = await this.findUserByUsernameAndPw({
          username,
          password: md5(password),
          isDelete: false
        })

        if (!findUser) {
          return Promise.reject(ResCode.UserAccountOrPasswordError)
        }


        return findUser
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 通过用户名和密码查询用户
    async findUserByUsernameAndPw(params) {
      try {
        const userInfo = await this.ctx.model.User.findOne(params, 'id')
        return userInfo
      }
      catch(e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 通过不同的条件获取用户信息
    async findUserById(id) {
      try {
        if (!id) {
          return Promise.reject(ResCode.UserIdIllegal)
        }

        const userInfo = await app.redis.get(`wb:user:${id}`)
        if (userInfo) {
          return JSON.parse(userInfo)
        }

        if (!this.ctx.helper.isObjectId(id)) {
          return Promise.reject(ResCode.UserIdIllegal)
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
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 新增用户
    async insertUser() {
      try {
        const {
          ctx
        } = this
        const requestBody = ctx.request.body

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
          return Promise.reject(ResCode.UserAccountNotFound)
        }

        if (!password) {
          return Promise.reject(ResCode.UserPasswordNotFound)
        }

        if (!nickname) {
          return Promise.reject(ResCode.UserNicknameNotFound)
        }

        if (!departmentId) {
          return Promise.reject(ResCode.UserDepartmentNotFound)
        }

        if (!role) {
          return Promise.reject(ResCode.UserRoleNotFound)
        }

        if (!title) {
          return Promise.reject(ResCode.UserTitleNotFound)
        }

        // 查找用户，第一步验证用户名
        const findUser = await ctx.model.User.findOne({
          username,
          isDelete: false
        })

        if (findUser) {
          return Promise.reject(ResCode.UserHasExist)
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
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 更新用户
    async updateUser() {
      try {
        const { ctx } = this
        const id = ctx.params.id
        const requestBody = ctx.request.body

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
          return Promise.reject(ResCode.UserNicknameNotFound)
        }

        if (!departmentId) {
          return Promise.reject(ResCode.UserDepartmentNotFound)
        }

        if (!ctx.helper.isObjectId(departmentId)) {
          return Promise.reject(ResCode.DepartmentIdIllegal)
        }

        if (!role) {
          return Promise.reject(ResCode.UserRoleNotFound)
        }

        if (!title) {
          return Promise.reject(ResCode.UserTitleNotFound)
        }

        if (!ctx.helper.isObjectId(id)) {
          return Promise.reject(ResCode.UserIdIllegal)
        }

        if (!status) {
          return Promise.reject(ResCode.UserStatusNotFound)
        }

        const user = await this.findUserById(id)
        if (!user) {
          return Promise.reject(ResCode.UserDontExist)
        }

        // 查找用户并更新
        await app.redis.del(`wb:user:${id}`)

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
          return Promise.reject(ResCode.UserDontExist)
        }

        // 动态计算所有
        if (String(user.department._id) !== String(departmentId)) {
          this.calcMemberCount([user.department._id, departmentId])

          // 同步任务关联用户
          await ctx.service.mission.updateManyDepartment(id, departmentId)
        }
      }
      catch (e) {
        return Promise.reject({
          ...ResCode.Error,
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
          return Promise.reject(ResCode.UserIdIllegal)
        }

        // 查找用户并更新
        await app.redis.del(`wb:user:${id}`)

        const result = await ctx.model.User.findOneAndUpdate({
          _id: id
        }, {
          $set: {
            isDelete: true
          }
        },{new: true})

        if (!result) {
          return Promise.reject(ResCode.UserDontExist)
        }

        // 更新用户
        this.calcMemberCount([result.department])
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
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

        const count = await ctx.model.User.find(params).count()
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
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 更新密码
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
          return Promise.reject(ResCode.UserPasswordNotFound)
        }

        if (!newPassword) {
          return Promise.reject(ResCode.UserNewPasswordNotFound)
        }

        if (!ctx.helper.isObjectId(id)) {
          return Promise.reject(ResCode.UserIdIllegal)
        }

        const findOne = await this.findUserByUsernameAndPw({
          _id: id,
          password: md5(password)
        })

        if (!findOne) {
          return Promise.reject(ResCode.UserPasswordError)
        }

        // 查找用户并更新
        await app.redis.del(`wb:user:${id}`)

        const result = await ctx.model.User.update({
          _id: id,
          password: md5(password)
        }, {
          $set: {
            password: md5(newPassword)
          }
        })
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 重置密码
    async resetPassword() {
      try {
        const { ctx } = this
        const id = ctx.params.id
        const requestBody = ctx.request.body
        const { newPassword } = requestBody

        if (!newPassword) {
          return Promise.reject(ResCode.UserNewPasswordNotFound)
        }

        if (!ctx.helper.isObjectId(id)) {
          return Promise.reject(ResCode.UserIdIllegal)
        }

        const findOne = await this.findUserById(id)

        if (!findOne) {
          return Promise.reject(ResCode.UserDontExist)
        }

        await app.redis.del(`wb:user:${id}`)

        // 查找用户并更新
        const result = await ctx.model.User.update({
          _id: id
        }, {
          $set: {
            password: md5(newPassword)
          }
        })
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 更新部门用户数量
    async calcMemberCount(list) {
      try {
        list.forEach(async (item, index) => {
          const id = app.mongoose.Types.ObjectId(item)
          const count = await this.ctx.model.User.find({
            department: id,
            isDelete: false
          }).count()

          // 删除缓存
          await app.redis.del(`wb:department:${id}`)

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
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 获取单个用户
    async getOneUser(_id){
       try {
        const { ctx } = this
        const id = _id || ctx.params.id
        const user = await this.findUserById(id)
        if (!user) {
          return Promise.reject(ResCode.UserDontExist)
        }

        return user
      }
      catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }
  }
  return UserService
}
