const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  class ProjectService extends app.Service {
    // 查询项目
    async getList() {
      try {
        const {
          ctx
        } = this

        const list = await ctx.model.Project.find({
            isDelete: {
              $ne: true
            }
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
              path: 'users.info',
              select: '-createTime -updateTime -isDelete -password -department -role'
            }
          })

        return list
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
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
        },{new: true})

        if (result) {
          await app.redis.set(`wb:project:${pid}`, JSON.stringify(result))
        }
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
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
          return Promise.reject({
            code: ResCode.ProjectIdError
          })
        }

        const result = await this.findProjectById(id)

        if (!result) {
          return Promise.reject({
            code: ResCode.ProjectDontExist
          })
        }

        return result
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
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
          path: 'users.info',
          select: '-createTime -updateTime -isDelete -password -department -role'
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
          return Promise.reject({
            code: ResCode.ProjectNameEmpty
          })
        }

        if (!deadline) {
          return Promise.reject({
            code: ResCode.ProjectDeadlineEmpty
          })
        }

        if (!departments || departments.length === 0) {
          return Promise.reject({
            code: ResCode.ProjectDepartmentEmpty
          })
        }

        return await ctx.model.Project.create({
          name,
          deadline,
          description,
          departments,
          weight
        })

      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
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
          params.deadline = deadline
        }

        if (departments && departments.length === 0) {
          params.departments = departments
        }

        if (weight) {
          params.weight = weight
        }

        // 找到并且更新
        const result = await ctx.model.Project.update({
          _id: id
        }, {
          $set: params
        })

        if (!result.n) {
          return Promise.reject({
            code: ResCode.ProjectDontExist
          })
        }

        await app.redis.del(`wb:project:${id}`)

      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
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
          return Promise.reject({
            code: ResCode.ProjectIdError
          })
        }

        // 找到并且更新
        const findProject = await ctx.model.Project.update({
          _id: id
        }, {
          $set: {
            isDelete: true
          }
        })

        if (findProject.n) {
          await app.redis.del(`wb:project:${id}`)
        }

      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }
  }
  return ProjectService
}
