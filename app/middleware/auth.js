const HttpStatus = require('./httpStatus')

module.exports = roles => {
  return async function response(ctx, next) {
    if (!roles || roles.length === 0) {
      return await next()
    }

    if (!ctx.header || !ctx.header.authorization) {
      return ctx.error({
        status: HttpStatus.StatusUnauthorized
      })
    }

    try {
      const role = ctx.userInfo.role

      const hasAuth = roles.includes(role)

      if (!hasAuth) {
        return ctx.error({
          status: HttpStatus.StatusUnauthorized
        })
      }
    } catch (e) {
      return ctx.error({
        status: HttpStatus.StatusUnauthorized
      })
    }
    await next()
  }
}
