/*
* @ use 统一请求中间件，记录日志
*/
module.exports = () => {
  return async function request(ctx, next) {
    const { request } = ctx
    const requestId = +new Date()
    const log = {}
    log.method = request.method
    log.url = request.url
    log.headers = request.header
    log.params = ctx.params
    log.body = request.body
    log.query = ctx.query
    log.search = ctx.search
    log.requestId = requestId
    ctx.logger.info(`\n请求日志·${requestId}>>>>>>>>>>>>>>>>>>>>>>>:\n${JSON.stringify(log)}\n`)
    ctx.request.requestId = requestId
    await next()
  }
}
