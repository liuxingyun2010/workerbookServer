'use strict';
const ResCode = require('../middleware/responseCode')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  return class AnalysisController extends app.Controller {
    // 我的任务列表
    async departmentList() {
      const { ctx } = this
      try {

        const result = await ctx.service.analysis.findDepartmentAnalysis()

        ctx.success({
          data: result
        })
      }
      catch (e) {
        ctx.error({
          code: e.code
        })
      }
    }
  }
}

