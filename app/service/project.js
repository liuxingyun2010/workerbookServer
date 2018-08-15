const ResCode = require('../middleware/responseStatus')
const HttpStatus = require('../middleware/httpStatus')
const moment = require('moment')

module.exports = app => {
  class ProjectService extends app.Service {
    // 查询项目
    async getList() {
      try {
        const {
          ctx
        } = this

        let result = {}

        let params = {
          isDelete: {
            $ne: true
          }
        }

        let {
          skip = 0, limit = 0
        } = ctx.query
        skip = Number(skip)
        limit = Number(limit)

        const list = await this.findProjectList(params, skip, limit)

        const count = await ctx.model.Project.find(params).count()

        result.count = count
        result.list = list

        if (limit) {
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

    // 根据角色查询项目
    async getListByRole() {
      try {
        const {
          ctx
        } = this

        const role = ctx.userInfo.role

        if (role === 1) {
          return this.sqlFindProjectByUser(ctx.userInfo._id)
        } else if (role === 2) {
          return this.sqlFindProjectByDepartment(ctx.userInfo.department._id)
        } else {
          return this.sqlFindProjectAll()
        }
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    async findProjectList(params, skip, limit) {
      try {
        const {
          ctx
        } = this

        const list = await ctx.model.Project.find(params, '-updateTime -isDelete').skip(skip).limit(limit)
          .populate({
            path: 'departments',
            match: {
              isDelete: false
            },
            select: {
              name: 1,
              count: 1,
              _id: 1,
            }
          })
          .populate({
            path: 'missions',
            select: '-isDelete -updateTime',
            match: {
              isDelete: false
            },
            populate: {
              path: 'user',
              select: '-createTime -updateTime -password -department -role'
            }
          }).sort({
          createTime: -1
        })

        list.forEach(item => {
          const missions = item.missions

          // 所有任务的进度 除以 数量 得到项目进度
          let countProgress = 0
          let now = new Date()
          missions.forEach(doc => {
            if (now > doc.deadline) {
              doc._doc.isTimeout = true
            }
            else {
              doc._doc.isTimeout = false
            }
            countProgress += doc.progress
          })

          item._doc.progress = Math.floor(countProgress / missions.length) || 0

        })

        return list
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 根据部门查询所有项目
    async sqlFindProjectByDepartment(id) {
      try {
        const {
          ctx
        } = this

        let result = {}

        let params = {
          isDelete: {
            $ne: true
          },
          status: 1,
          departments: app.mongoose.Types.ObjectId(id)
        }

        let {
          skip = 0, limit = 0
        } = ctx.query
        skip = Number(skip)
        limit = Number(limit)

        const list = await this.findProjectList(params, skip, limit)

        const count = await ctx.model.Project.find(params).count()

        result.count = count
        result.list = list

        if (limit) {
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

    // 管理员查询所有项目
    async sqlFindProjectAll() {
      try {
        const {
          ctx
        } = this

        let result = {}

        let params = {
          isDelete: {
            $ne: true
          },
          status: 1
        }

        let {
          skip = 0, limit = 0
        } = ctx.query
        skip = Number(skip)
        limit = Number(limit)

        const list = await this.findProjectList(params, skip, limit)

        const count = await ctx.model.Project.find(params).count()

        result.count = count
        result.list = list

        if (limit) {
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

    // 获取单个用户所有的项目
    async sqlFindProjectByUser(id) {
      try {
        const {
          ctx
        } = this

        // 查询出用户所有的正在进行中任务
        const missionList = await ctx.model.Mission.find({
          user: app.mongoose.Types.ObjectId(id)
        }, '_id')

        const myMissions = missionList.map(item => item._id)

        let result = {}

        let params = {
          isDelete: {
            $ne: true
          },
          status: 1,
          missions: {
            $in: myMissions
          }
        }

        let {
          skip = 0, limit = 0
        } = ctx.query
        skip = Number(skip)
        limit = Number(limit)

        const list = await this.findProjectList(params, skip, limit)

        const count = await ctx.model.Project.find(params).count()

        result.count = count
        result.list = list

        if (limit) {
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

    // 项目中添加任务
    async addMission(pid, mid) {
      try {
        const result = await this.ctx.model.Project.findOneAndUpdate({
          _id: pid
        }, {
          $push: {
            missions: app.mongoose.Types.ObjectId(mid)
          }
        })

        if (result) {
          await app.redis.del(`wb:project:${pid}`)
        }
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 获取单个项目
    async findProject() {
      try {
        const {
          ctx
        } = this

        const id = ctx.params.id

        if (!this.ctx.helper.isObjectId(id)) {
          return Promise.reject(ResCode.ProjectIdIllegal)
        }

        const result = await this.findProjectById(id)

        if (!result) {
          return Promise.reject(ResCode.ProjectDontExist)
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

    // 通过id查询项目
    async findProjectById(id) {
      const result = await app.redis.get(`wb:project:${id}`)
      if (result) {
        return JSON.parse(result)
      }

      const project = await this.ctx.model.Project.findOne({
          _id: id
        }, '-createTime -updateTime -isDelete')
        .populate({
          path: 'departments',
          select: {
            name: 1,
            count: 1,
            _id: 1,
          }
        })
        .populate({
          path: 'missions',
          select: '-isDelete -updateTime',
          populate: {
            path: 'user',
            select: '-createTime -updateTime -password -department -role'
          }
        })

      if (project) {
        await app.redis.set(`wb:project:${id}`, JSON.stringify(project))
      }

      return project
    }

    // 添加项目
    async save() {
      try {
        const {
          ctx
        } = this

        const requestBody = ctx.request.body
        const {
          name,
          deadline,
          description = '',
          departments,
          weight = 1
        } = requestBody

        if (!name) {
          return Promise.reject(ResCode.ProjectNameNofound)
        }

        if (!deadline) {
          return Promise.reject(ResCode.ProjectDeadlineNofound)
        }

        if (!departments || departments.length === 0) {
          return Promise.reject(ResCode.DepartmentNameNotFound)
        }

        return await ctx.model.Project.create({
          name,
          deadline: new Date(`${deadline.split('T')[0]} 23:59:59`),
          description,
          departments,
          weight
        })

      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 更新项目
    async update() {
      try {
        const {
          ctx
        } = this
        const id = ctx.params.id
        const requestBody = ctx.request.body
        const {
          name,
          deadline,
          description = '',
          departments,
          weight = 1
        } = requestBody

        const params = {}
        if (name) {
          params.name = name
        }

        if (deadline) {
          params.deadline = new Date(`${deadline.split('T')[0]} 23:59:59`)
        }

        if (departments && departments.length > 0) {
          params.departments = departments
        }

        if (weight) {
          params.weight = weight
        }

        if (description) {
          params.description = description
        }

        await app.redis.del(`wb:project:${id}`)

        // 找到并且更新
        const result = await ctx.model.Project.update({
          _id: id
        }, {
          $set: params
        })

        if (!result.n) {
          return Promise.reject(ResCode.ProjectDontExist)
        }
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 删除项目
    async delete() {
      try {
        const {
          ctx
        } = this
        const id = ctx.params.id

        if (!this.ctx.helper.isObjectId(id)) {
          return Promise.reject(ResCode.ProjectIdIllegal)
        }

        await app.redis.del(`wb:project:${id}`)

        // 找到并且更新
        const findProject = await ctx.model.Project.update({
          _id: id
        }, {
          $set: {
            isDelete: true
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
  }
  return ProjectService
}
