const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  class DepartmentService extends app.Service {
    // 查询部门
    async getDepartmentList() {
      try {
        const { ctx } = this

        // 过滤掉管理员
        const params = {
          isDelete: {
            $ne: true
          }
        }

        let result = {}

        let sql = [{
          $match: {
            isDelete: {$ne: true}
          }
        },{
          $project: {
            id: '$_id',
            _id: 0,
            name: 1,
            count: 1,
            createTime: 1
          }
        }]

        let { skip = 0, limit = 0 } = ctx.query
        skip = Number(skip)
        limit = Number(limit)

        if (limit){
          sql.push({
            $skip: skip
          },{
            $limit: limit
          })
        }

        const count = await ctx.model.User.countDocuments(params)

        const list = await ctx.model.Department.aggregate(sql)

        result.count = count
        result.list = list

        if(limit) {
          result.limit = limit
          result.skip = skip
        }

        return result
      }catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 查询单个部门
    async findOneDepartment() {
      try {
        const { ctx } = this
        const id = this.ctx.params.id || ''

        if (!this.ctx.helper.isObjectId(id)) {
          return Promise.reject({
            code: ResCode.DepartmentIdError
          })
        }

        const department = await this.findDepartment({
          _id: id
        })

        if (!department) {
          return Promise.reject({
            code: ResCode.DepartmentExist
          })
        }

        return department
      }catch (e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 查找单个部门
    async findDepartment(params) {
      // 查找部门，不能重复
      const findDepartment = await this.ctx.model.Department.findOne(params)
      return findDepartment
    }

    // 添加部门
    async save() {
      try {
        const { ctx } = this
        const requestBody = ctx.request.body
        const { name } = requestBody

        if (!name) {
          return Promise.reject({
            code: ResCode.DepartmentNameEmpty
          })
        }

        const department = await this.findDepartment({
          name
        })

        if (department) {
          return Promise.reject({
            code: ResCode.DepartmentExist
          })
        }

        return await ctx.model.Department.create({
          name
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
        const { ctx } = this
        const id = ctx.params.id
        const requestBody = ctx.request.body

        const { name } = requestBody

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

      }catch(e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 删除部门
    async delete() {
      try {
        const { ctx } = this
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

      }catch(e) {
        return Promise.reject({
          code: ResCode.Error,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }
  }
  return DepartmentService
}
