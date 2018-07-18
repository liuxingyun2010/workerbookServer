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

const ResCode = require('./responseCode')
const HttpStatus = require('./httpStatus')

module.exports = () => {
  return async function response(ctx, next) {
    ctx.error = ({ code = ResCode.Error, status = HttpStatus.StatusOK } = { code: ResCode.Error, status: HttpStatus.StatusOK }) => {
      const resCode = code.resCode
      const resMsg = code.resMsg
      ctx.body = { resCode, resMsg }
      ctx.status = status
    }

    ctx.success = ({ data = null, code = ResCode.Success, status = HttpStatus.StatusOK} = { data: null, resCode: ResCode.Success, status: HttpStatus.StatusOK }) => {
      const resCode = code.resCode
      const resMsg = code.resMsg
      ctx.body = { data, resMsg, resCode }
      ctx.status = status
    }

    await next()
  }
}
