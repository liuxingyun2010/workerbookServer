'use strict';
const ResCode = require('../middleware/responseStatus')
const HttpStatus = require('../middleware/httpStatus')

module.exports = app => {
  return class AnalysisController extends app.Controller {
    // 部门列表数据
    async departmentList() {
      const { ctx } = this
      try {
        const result = await ctx.service.analysis.findDepartmentAnalysis()

        ctx.success({
          data: result
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 部门详情数据
    async departmentSummaryList() {
      const { ctx } = this
      try {
        const result = await ctx.service.analysis.findDepartmentSummaryAnalysis()

        ctx.success({
          data: result
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 项目列表数据
    async projectList() {
      const { ctx } = this
      try {
        const result = await ctx.service.analysis.findProjectAnalysis()

        ctx.success({
          data: result
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 部门中每个人的任务详情
    async departmentUserAnalysis() {
      const { ctx } = this
      try {
        const result = await ctx.service.analysis.findDepartmentUserAnalysis()

        ctx.success({
          data: result
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }

    // 项目总览
    async projectSummary() {
      const { ctx } = this
      try {
        const result = await ctx.service.analysis.findProjectSummaryAnalysis()

        ctx.success({
          data: result
        })
      }
      catch (e) {
        ctx.error(e)
      }
    }
  }
}

