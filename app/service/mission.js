const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  class ProjectService extends app.Service {
    // // 查询项目
    // async getList() {
    //   try {
    //     const {
    //       ctx
    //     } = this

    //     const list = await ctx.model.Project.find({
    //       isDelete: {
    //         $ne: true
    //       }
    //     }, '-createTime -updateTime -isDelete').populate({
    //       path: 'departments',
    //       select: {
    //         name: 1,
    //         count: 1,
    //         _id: 1
    //       }
    //     })

    //     return list
    //   } catch (e) {
    //     return Promise.reject({
    //       code: ResCode.Error,
    //       status: HttpStatus.StatusInternalServerError
    //     })
    //   }
    // }

    // // 查询单个部门
    // async findOneDepartment() {
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

    // // 查找单个部门
    // async findDepartment(params) {
    //   // 查找部门，不能重复
    //   const findDepartment = await this.ctx.model.Department.findOne(params)
    //   return findDepartment
    // }

    // 添加任务
    async save() {
      try {
        const {
          ctx
        } = this
        const requestBody = ctx.request.body
        const {
          name,
          deadline,
          projectId,
          description = '',
        } = requestBody


        if (!name) {
          return Promise.reject({
            code: ResCode.MissionNameEmpty
          })
        }

        if (!projectId) {
          return Promise.reject({
            code: ResCode.MissionProjectIdEmpty
          })
        }

        if (!ctx.helper.isObjectId(projectId)) {
          return Promise.reject({
            code: ResCode.MissionProjectIdError
          })
        }

        if (!deadline) {
          return Promise.reject({
            code: ResCode.MissionDeadlineEmpty
          })
        }

        // 判断项目是否存在
        const projectInfo = await ctx.service.project.findProjectById(projectId)

        if (!projectInfo) {
          return Promise.reject({
            code: ResCode.MissionProjectDontExist
          })
        }

        // 如果项目存在，则需要判断任务的截止时间不能大于项目的截止时间
        if (new Date(projectInfo.deadline) < new Date(deadline)) {
          return Promise.reject({
            code: ResCode.MissionDeadlineError
          })
        }

        const missionResult = await ctx.model.Mission.create({
          name,
          deadline,
          description
        })


        const missionId = missionResult._id
        if (missionId) {
          await ctx.service.project.addMission(projectId, missionId)
        }
      } catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }


    // 更新任务
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
          projectId,
          description = '',
        } = requestBody

        if (!name) {
          return Promise.reject({
            code: ResCode.MissionNameEmpty
          })
        }

        if (!projectId) {
          return Promise.reject({
            code: ResCode.MissionProjectIdEmpty
          })
        }

        if (!ctx.helper.isObjectId(projectId)) {
          return Promise.reject({
            code: ResCode.MissionProjectIdError
          })
        }

        if (!deadline) {
          return Promise.reject({
            code: ResCode.MissionDeadlineEmpty
          })
        }

        // 判断项目是否存在
        const projectInfo = await ctx.service.project.findProjectById(projectId)

        if (!projectInfo) {
          return Promise.reject({
            code: ResCode.MissionProjectDontExist
          })
        }

        // 如果项目存在，则需要判断任务的截止时间不能大于项目的截止时间
        if (new Date(projectInfo.deadline) < new Date(deadline)) {
          return Promise.reject({
            code: ResCode.MissionDeadlineError
          })
        }

        // 找到并且更新
        return await ctx.model.Mission.update({
          _id: id
        }, {
          $set: {
            name,
            deadline,
            description
          }
        })
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
