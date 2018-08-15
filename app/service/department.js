const ResCode = require('../middleware/responseStatus')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  class DepartmentService extends app.Service {
    // 查询部门
    async getDepartmentList() {
      try {
        const { ctx } = this

        // 过滤掉已经被删除的部门
        const params = {
          isDelete: false
        }

        let result = {}
        let sql = [{
          $match: {
            isDelete: false
          }
        },{
          $project: {
            id: '$_id',
            _id: 0,
            name: 1,
            count: 1,
            createTime: 1
          }
        },{
          $sort: {
            createTime: -1
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

        const count = await ctx.model.Department.count(params)

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
          ...ResCode.Error,
          error: e,
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
          return Promise.reject(ResCode.DepartmentIdIllegal)
        }

        const department = await this.findOneDepartmentByRedis(id)

        if (!department) {
          return Promise.reject(ResCode.DepartmentHasExist)
        }

        return department
      }catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }

    // 查询单个部门，通过id
    async findOneDepartmentByRedis(id) {
      try {
        if (!this.ctx.helper.isObjectId(id)) {
          return Promise.reject(ResCode.DepartmentIdIllegal)
        }

        const department = await app.redis.get(`wb:department:${id}`)
        if (department) {
          return JSON.parse(department)
        }

        const findDepartment = await this.ctx.model.Department.findOne({
          _id: id
        })

        if (findDepartment) {
          await app.redis.set(`wb:user:${id}`, JSON.stringify(findDepartment))
        }

        return findDepartment
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
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
          return Promise.reject(ResCode.DepartmentNameNotFound)
        }

        const department = await this.findDepartment({
          name,
          isDelete: false
        })

        if (department) {
          return Promise.reject(ResCode.DepartmentHasExist)
        }

        return await ctx.model.Department.create({
          name
        })
      } catch (e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
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
          return Promise.reject(ResCode.DepartmentNameNotFound)
        }

        if (!this.ctx.helper.isObjectId(id)) {
          return Promise.reject(ResCode.DepartmentIdIllegal)
        }

        // 查找部门，不能存在重名的名称
        const department = await this.findDepartment({
          _id: {
            $ne: id
          },
          name: name
        })

        if (department) {
          return Promise.reject(ResCode.DepartmentHasExist)
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
          return Promise.reject(ResCode.DepartmentDontExist)
        }
      }catch(e) {
        return Promise.reject({
          ...ResCode.Error,
          error: e,
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
          return Promise.reject(ResCode.DepartmentIdIllegal)
        }

        // 查找部门，不能存在重名的名称
        const departmentResult = await this.findOneDepartmentByRedis(id)
        if (!departmentResult) {
          return Promise.reject(ResCode.DepartmentDontExist)
        }

        if (departmentResult.count !== 0) {
          return Promise.reject(ResCode.DepartmentRemoveForbidden)
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
          ...ResCode.Error,
          error: e,
          status: HttpStatus.StatusInternalServerError
        })
      }
    }
  }
  return DepartmentService
}
