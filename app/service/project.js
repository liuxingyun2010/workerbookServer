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
        }, '-createTime -updateTime -isDelete').populate({
          path: 'departments',
          select: {
            name: 1,
            count: 1,
            _id: 1,
          }
        }).populate('missions', '-isDelete -updateTime')

        return list
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 添加任务
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
          await app.redis.set(`wb:project:${pid}`, JSON.stringify(result))
        }
      }
      catch(e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // // 查询单个部门
    // async findOneProject() {
    //   try {
    //     const { ctx } = this
    //     const id = this.ctx.params.id || ''

    //     if (!this.ctx.helper.isObjectId(id)) {
    //       return Promise.reject({
    //         code: ResCode.DepartmentIdError
    //       })
    //     }

    //     const department = await this.findDepartment({
    //       _id: id
    //     })

    //     if (!department) {
    //       return Promise.reject({
    //         code: ResCode.DepartmentExist
    //       })
    //     }

    //     return department
    //   }catch (e) {
    //     return Promise.reject({
    //       code: ResCode.Error,
    //       status: HttpStatus.StatusInternalServerError
    //     })
    //   }
    // }

    // 通过id查询项目
    async findProjectById(id) {
      const result = await app.redis.get(`wb:project:${id}`)

      if (result) {
        return JSON.parse(result)
      }

      const project = await this.ctx.model.Project.findOne({
        _id: id
      })

      if (project) {
        await app.redis.set(`wb:project:${id}`, JSON.stringify(project))
      }

      return project
    }

    // 添加部门
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


    // 更新
    async update() {
      try {
        const {
          ctx
        } = this
        const id = ctx.params.id
        const requestBody = ctx.request.body

        const {
          name
        } = requestBody

        if (!name) {
          return Promise.reject({
            code: ResCode.DepartmentNameEmpty
          })
        }

        if (!this.ctx.helper.isObjectId(id)) {
          return Promise.reject({
            code: ResCode.DepartmentIdError
          })
        }


        // 查找部门，不能存在重名的名称
        const department = await this.findDepartment({
          _id: {
            $ne: id
          },
          name: name
        })

        if (department) {
          return Promise.reject({
            code: ResCode.DepartmentExist
          })
        }

        // 找到并且更新
        const result = await ctx.model.Department.update({
          _id: id
        }, {
          $set: {
            name
          }
        })

        if (!result.n) {
          return Promise.reject({
            code: ResCode.DepartmentDontExist
          })
        }

      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 删除部门
    async delete() {
      try {
        const {
          ctx
        } = this
        const id = ctx.params.id

        if (!this.ctx.helper.isObjectId(id)) {
          return Promise.reject({
            code: ResCode.DepartmentIdError
          })
        }

        // 查找部门，不能存在重名的名称
        const departmentResult = await this.findDepartment({
          _id: id
        })

        if (!departmentResult) {
          return Promise.reject({
            code: ResCode.DepartmentDontExist
          })
        }

        if (departmentResult.count !== 0) {
          return Promise.reject({
            code: ResCode.DepartmentDontRemove
          })
        }

        // 找到并且更新
        const findDepartment = await ctx.model.Department.update({
          _id: id
        }, {
          $set: {
            isDelete: true
          }
        })

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
