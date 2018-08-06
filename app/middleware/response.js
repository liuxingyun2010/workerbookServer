/*
 * @ use 统一响应请求中间件
 * @ error-data 返回错误时，可携带的数据
 * @ error-resMsg  自定义的错误提示信息
 * @ error-resCode 错误返回码 999999系统错误，其他待定
 * @ error-errdata 可返回服务器生成的错误
 * @ success-data  请求成功时响应的数据
 * @ success-resMsg  请求成功时响应的提示信息
 * @ succrss-resCode 000000为返回成功，和appserver保持一致
 * @ 调用ctx.error()   响应错误
 * @ 调用ctx.success()  响应成功
 */

const ResCode = require('./responseStatus')
const HttpStatus = require('./httpStatus')

module.exports = () => {
  return async function response(ctx, next) {
    ctx.error = ({
      resCode = ResCode.Error.resCode,
      resMsg = ResCode.Error.resMsg,
      error,
      status = HttpStatus.StatusOK
    } = {
      resCode: ResCode.Error.resCode,
      resMsg: ResCode.Error.resMsg,
      error,
      status: HttpStatus.StatusOK
    }) => {
      ctx.body = {
        msg: resMsg,
        code: resCode
      }
      ctx.logger.info(`\n响应日志.${ctx.request.requestId}>>>>>>>>>>>>>>>>>>\n${error && error.stack? error.stack: resMsg}\n`)
      ctx.status = status
    }

    ctx.success = ({
      data = null,
      resCode = ResCode.Success.resCode,
      resMsg = ResCode.Success.resMsg,
      status = HttpStatus.StatusOK
    } = {
      data: null,
      resCode: ResCode.Success.resCode,
      resMsg: ResCode.Success.resMsg,
      status: HttpStatus.StatusOK
    }) => {
      ctx.body = {
        data,
        msg: resMsg,
        code: resCode
      }

      ctx.status = status
    }

    await next()
  }
}
